import type { SkillContent } from "../types";

/**
 * AWS — full 50-section knowledge page.
 * Note: code blocks use ~~~ fences (CommonMark-equivalent to backtick fences)
 * so this file needs no backtick escaping inside the template literals.
 */
const aws: SkillContent = {
  overview: `
Amazon Web Services (AWS) is the largest public cloud platform in the world: a collection of over 200 on-demand services — compute, storage, databases, networking, machine learning, and more — rented by the hour, second, or request instead of bought as hardware. For an AI engineer, AWS is usually the place the model, the API, and the data actually live once a prototype becomes a product.

AWS's core idea is renting **undifferentiated heavy lifting**. Racking servers, replacing failed disks, patching hypervisors, and building global fiber networks create zero competitive advantage for almost any company — so AWS does that work at massive scale and sells access to the result. What you get in return is elasticity (scale from 1 to 10,000 requests/second without buying anything), global reach (deploy near users on six continents), and a menu of managed services that replace weeks of undifferentiated engineering (a managed Postgres instead of running your own; a managed Kubernetes control plane instead of building one).

The platform is enormous, but a working AI engineer needs real fluency in roughly twenty services: EC2 and Lambda (compute), S3 and EBS (storage), RDS/Aurora and DynamoDB (databases), VPC and its subnets/security-groups/load-balancers (networking), and IAM (the security backbone that every other service defers to for "who can do what"). Everything else is a variation or composition of these primitives. This page treats AWS the way a Principal Engineer does: not as a list of icons, but as a set of tradeoffs — compute model, consistency model, blast radius, and cost — that you choose deliberately for each workload.

Key characteristics: API-first (the console is just one client of the same APIs the CLI, SDKs, and Terraform use), organized around **regions** and **availability zones** for fault isolation, billed on a pay-as-you-go model with steep discounts for committed or interruptible usage, and governed end-to-end by the **shared responsibility model** — AWS secures the cloud, you secure what you put in it.
`,

  history: `
AWS traces its origin to an internal Amazon.com problem: by the early 2000s, Amazon's retail engineering teams were constantly blocked waiting for centralized infrastructure teams to provision databases and servers. Around 2002, Jeff Bezos issued the now-famous internal mandate that all teams expose their functionality through service interfaces (APIs) — no direct database or process access between teams — with the explicit intent that these interfaces be built as if they might one day be externalized. That service-oriented re-architecture is the direct ancestor of AWS: once internal systems were already service-shaped, offering them externally was a much smaller step.

| Year | Milestone |
|------|-----------|
| 2002 | Bezos's internal API mandate forces Amazon into a service-oriented architecture |
| 2004 | Simple Queue Service (SQS) — the first AWS service, built internally |
| 2006 | S3 (March) and EC2 (August, limited beta) launch publicly — AWS as a business is born |
| 2009 | Amazon RDS and Amazon VPC launch — managed databases and isolated networking |
| 2010 | AWS becomes a distinct business unit; Route 53 (DNS) launches |
| 2012 | DynamoDB launches; the first re:Invent conference is held |
| 2013 | Redshift (data warehousing) reaches general availability |
| 2014 | Lambda launches at re:Invent — event-driven, no-server-management compute; ECS launches for Docker orchestration |
| 2015 | Aurora reaches general availability; the Well-Architected Framework whitepaper is published |
| 2017 | Fargate launches — serverless compute for containers, no EC2 instances to manage |
| 2018 | EKS (managed Kubernetes) reaches general availability; Graviton (custom ARM CPU) is announced |
| 2019 | IMDSv2 introduced for EC2 metadata service hardening, directly in response to SSRF-based credential theft incidents in the industry |
| 2021 | Andy Jassy (former AWS CEO) becomes Amazon CEO; Adam Selipsky becomes AWS CEO; Sustainability added as the sixth Well-Architected pillar |
| 2023 | Amazon Bedrock launches — a managed service for foundation models (Anthropic, Meta, Cohere, Amazon's own Titan) accessed via a single API |
| 2024–2025 | Continued investment in custom AI silicon (Trainium2, Inferentia2) and Graviton4 for price-performance; genAI capabilities embedded across the console and CLI |

The pattern across two decades is consistent: AWS ships a primitive (EC2, S3), then a managed abstraction over that primitive (Lambda over servers, Aurora over databases, Bedrock over GPU clusters), each removing one more layer of undifferentiated operational work from customers. Verify exact dates for anything after my knowledge cutoff (see Latest Updates) against the official AWS "What's New" page.
`,

  "why-it-exists": `
Before AWS, running a web application meant owning the **entire hardware lifecycle**: forecasting demand months in advance, submitting a purchase order, waiting weeks for servers to arrive, racking and cabling them in a leased data center, and over-provisioning for a traffic peak (Black Friday, a product launch) that might use 5x your average capacity for three days a year and sit idle the other 362.

That model created three structural problems:

1. **Capital lock-up**: infrastructure was a large upfront capital expenditure (capex), meaning startups needed to guess their scale and pay for it before earning a dollar of revenue from it.
2. **Slow elasticity**: scaling up meant a new procurement cycle measured in weeks; scaling down meant hardware you'd already paid for sitting idle.
3. **Duplicated undifferentiated work**: every company that wanted a reliable database or a scalable file store had to build and operate one from scratch — hiring people to do work that created no differentiation versus competitors.

AWS's founding insight — visible in the API mandate that preceded it — was that Amazon's own retail business had already solved the "how do teams get compute and storage without waiting on a central team" problem internally. Externalizing those same internal services converted infrastructure from a capex problem into an opex (operating expenditure) problem: rent by the hour, pay only for what you use, and let someone else own the hardware lifecycle, the data center leases, and the 24/7 operations staff.
`,

  "problem-it-solves": `
AWS solves the **elastic infrastructure problem**: matching compute/storage/network capacity to actual demand, continuously, without a human in the procurement loop.

Concrete pains it removes:

- **Provisioning time**: a new database or 50 servers go from a multi-week procurement cycle to an API call that completes in minutes.
- **Idle capacity waste**: auto scaling groups add and remove compute in response to real load; you stop paying for machines the moment you terminate them.
- **Geographic reach**: deploying a service to Tokyo, Frankfurt, or São Paulo is a region selection, not a real-estate negotiation.
- **Undifferentiated operations**: patching database engines, replacing failed disks, replicating data across data centers, and managing hypervisor security are AWS's job, not yours, for managed services (RDS, S3, DynamoDB, Lambda).
- **Durability engineering**: S3's eleven-nines durability model (data replicated across multiple facilities with continuous integrity checking) would take a dedicated storage team years to approximate in-house.

What AWS deliberately does **not** solve:

- **Application architecture**: AWS gives you a highly available load balancer and a multi-AZ database, but if your application stores session state in a local variable on one server, it still won't survive that server dying. Statelessness, idempotency, and graceful degradation are still your job.
- **Cost discipline**: elasticity cuts both ways — it is exactly as easy to accidentally leave a fleet of GPU instances running as it is to scale them down. AWS gives you the tools (Budgets, Cost Explorer, tagging) but not the discipline.
- **Security by default in every configuration**: many services are secure by default today (S3 buckets are private unless explicitly opened), but the shared responsibility model still means every misconfigured security group, IAM policy, or public bucket is on the customer side of the line.
- **Vendor-neutral portability**: heavy use of proprietary managed services (DynamoDB's API, Lambda's execution model) creates real switching cost versus a competitor cloud or on-prem — a tradeoff you make consciously, not a defect.
`,

  "learning-objectives": `
By the end of this page you should be able to:

1. Explain the shared responsibility model precisely enough to correctly attribute a real security incident to AWS's side or the customer's side of the line.
2. Choose between EC2, Lambda, ECS/EKS, and Fargate for a given workload and justify the choice on cost, operational overhead, and latency grounds.
3. Design a VPC with public and private subnets, route tables, an internet gateway, a NAT gateway, and security groups that implement least-privilege network access.
4. Write IAM policies that follow least privilege, and explain the difference between users, roles, groups, and policies (identity-based vs resource-based).
5. Provision a production-shaped three-tier service — an API behind an Application Load Balancer, in a VPC, backed by a Multi-AZ RDS database — and explain the purpose of every component.
6. Apply the AWS Well-Architected Framework's six pillars to review an existing architecture and identify concrete gaps.
7. Optimize AWS spend using Reserved Instances, Savings Plans, and Spot Instances, and explain when each is (and isn't) appropriate.
8. Instrument a service with CloudWatch metrics, logs, and alarms, and describe an escalation path for debugging a production incident.
9. Recognize and remediate the recurring production pitfalls: public S3 buckets, overly broad IAM policies, untagged resources, and missing Multi-AZ configuration.
10. Map a typical application stack (FastAPI + Postgres + Redis) onto the equivalent managed AWS services and reason about the tradeoffs of that mapping.
`,

  prerequisites: `
- **Required**: basic networking concepts (IP addresses, DNS, HTTP/HTTPS, ports), comfort with a Linux command line, and an understanding of the client-server model. This page does not assume prior cloud experience.
- **Helpful**: familiarity with containers — see the **Docker** skill — since ECS, EKS, and Fargate are all ways of running containers on AWS. Familiarity with **Git** helps for the CI/CD and IaC sections.
- **For the infrastructure-as-code angle**: this page shows AWS's native IaC (CloudFormation) briefly, but production teams increasingly provision AWS resources with the **Terraform** skill's HCL — read that page alongside this one if your goal is "provision AWS in code."
- **For container workloads**: once you understand EC2/ECS/EKS/Fargate here, the **Kubernetes** skill goes deep on the orchestration layer that EKS manages for you.

Dependency links: Linux and networking fundamentals → this page → **Terraform** (provisioning), **Docker** and **Kubernetes** (container workloads), **CI/CD**, **GitHub Actions**, and **Jenkins** (deployment pipelines) all build directly on AWS fluency. **Azure** and **GCP** are natural comparison reading once this page is solid.
`,

  "beginner-concepts": `
### Regions, Availability Zones, and edge locations

AWS infrastructure is organized geographically in three layers. A **region** (for example us-east-1 in Virginia, or ap-south-1 in Mumbai) is a fully independent geographic area containing multiple **Availability Zones (AZs)** — physically separate data centers with independent power, cooling, and networking, connected by low-latency private links. **Edge locations** are a much larger set of smaller points-of-presence used by CloudFront (CDN) and Route 53 to serve content close to end users.

~~~text
Region (e.g. us-east-1)
  └── AZ us-east-1a  — physically separate data center
  └── AZ us-east-1b  — physically separate data center
  └── AZ us-east-1c  — physically separate data center
~~~

The practical rule: anything that must survive a single data center failure (a database, a load-balanced fleet) must span at least two AZs. Anything that must survive a regional disaster needs a multi-region strategy (see Advanced Concepts).

### IAM basics: the security backbone

**IAM (Identity and Access Management)** controls who — or what service — can do what, on which resources. Every single AWS API call, from every source (console, CLI, another AWS service), is authenticated and authorized by IAM before anything happens.

~~~json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Action": ["s3:GetObject"],
      "Resource": "arn:aws:s3:::my-app-bucket/uploads/*"
    }
  ]
}
~~~

Core vocabulary: a **user** is a long-lived identity (a person or a legacy application); a **role** is a temporary identity assumed by a person or an AWS service (an EC2 instance, a Lambda function); a **policy** is the JSON document (like the one above) describing permitted actions; a **group** bundles policies for a set of users. The root account (the email you signed up with) should be locked away with MFA and never used day-to-day.

### EC2 basics: virtual machines on demand

~~~bash
# Launch a small Linux instance from a public Amazon Machine Image (AMI)
aws ec2 run-instances \\
  --image-id ami-0abcdef1234567890 \\
  --instance-type t3.micro \\
  --key-name my-keypair \\
  --security-group-ids sg-0123456789abcdef0 \\
  --subnet-id subnet-0123456789abcdef0
~~~

An **AMI** is a template (OS + preinstalled software) an instance boots from. **Instance types** (t3.micro, m6g.large, c7g.xlarge) trade off vCPU, memory, network bandwidth, and price — the "g" suffix marks Graviton (ARM) families, usually the best price-performance choice for new workloads. A **key pair** provides SSH access; losing the private key on a Linux instance without other access configured means you cannot log in.

### S3 basics: object storage

~~~bash
aws s3 mb s3://my-app-bucket-2026
aws s3 cp report.pdf s3://my-app-bucket-2026/reports/report.pdf
aws s3 ls s3://my-app-bucket-2026/reports/
~~~

S3 stores **objects** (arbitrary bytes plus metadata) inside **buckets** (globally uniquely named containers), addressed by a **key** (the path-like string). It is not a filesystem — there are no real directories, only key prefixes that look like paths. Storage classes trade retrieval speed for price: Standard (frequent access), Infrequent Access, Glacier (archival, retrieval takes minutes to hours).

### VPC basics: your private network

A **VPC (Virtual Private Cloud)** is an isolated slice of the AWS network, defined by a CIDR block (for example 10.0.0.0/16), inside which you create subnets, route tables, and security controls. Every account gets a **default VPC** per region for quick starts, but production workloads should use a deliberately designed custom VPC (see Intermediate Concepts).

### The CLI, SDKs, and the console are the same API

~~~bash
aws configure                 # set access key, secret key, default region
aws sts get-caller-identity   # "who am I?" — the first command to run anywhere new
~~~

Every click in the AWS Console issues the exact same API calls the CLI and SDKs (boto3 for Python) use. This matters: anything you can do in the console, you can automate — and production teams should automate almost everything (see Production Usage and the Terraform skill).

### Billing basics

New accounts get a **Free Tier** (a fixed monthly allowance of certain services, for 12 months plus some always-free amounts). Beyond that, you pay for what you provision — including resources you forgot were running. Setting a **Budget** with an alert on day one is the single highest-value five-minute action a beginner can take.
`,

  "intermediate-concepts": `
### VPC networking in depth

A production VPC splits its address space into **subnets** across multiple AZs, each subnet tagged public or private by its route table, not by any inherent property.

~~~text
VPC 10.0.0.0/16
├── Public subnet  10.0.1.0/24 (AZ-a) — route 0.0.0.0/0 → Internet Gateway
├── Public subnet  10.0.2.0/24 (AZ-b) — route 0.0.0.0/0 → Internet Gateway
├── Private subnet 10.0.11.0/24 (AZ-a) — route 0.0.0.0/0 → NAT Gateway (in public-a)
└── Private subnet 10.0.12.0/24 (AZ-b) — route 0.0.0.0/0 → NAT Gateway (in public-b)
~~~

- An **Internet Gateway (IGW)** lets resources with a public IP reach the internet directly — used by public subnets (load balancers, bastion hosts).
- A **NAT Gateway** lives in a public subnet and lets private-subnet resources (application servers, databases) initiate outbound connections (pulling a package, calling an external API) without being reachable from the internet.
- **Security groups** are stateful, instance/ENI-level firewalls: allow rules only (no explicit deny), and a response to an allowed inbound request is automatically allowed out.
- **Network ACLs (NACLs)** are stateless, subnet-level firewalls: they support explicit allow AND deny rules, evaluated in numbered order — used far less often, mainly as a coarse defense-in-depth layer.

~~~bash
# Allow inbound HTTPS from anywhere, and inbound app-port traffic only from the ALB's security group
aws ec2 authorize-security-group-ingress \\
  --group-id sg-app \\
  --protocol tcp --port 443 --cidr 0.0.0.0/0

aws ec2 authorize-security-group-ingress \\
  --group-id sg-app \\
  --protocol tcp --port 8000 --source-group sg-alb
~~~

### Load balancers: ALB vs NLB

- **Application Load Balancer (ALB)** operates at Layer 7 (HTTP/HTTPS): routes by path or host header, terminates TLS, integrates with WAF, ideal for microservices and REST/HTTP APIs.
- **Network Load Balancer (NLB)** operates at Layer 4 (TCP/UDP): ultra-low latency, handles millions of requests/second, preserves the client's source IP, used for raw TCP protocols or extreme-performance HTTP workloads.
- The Classic Load Balancer is legacy — new designs should never choose it.

### IAM roles for services

Applications should never embed long-lived access keys. An EC2 **instance profile** or a Lambda **execution role** grants temporary, automatically rotated credentials to the compute itself.

~~~json
{
  "Version": "2012-10-17",
  "Statement": [
    { "Effect": "Allow", "Principal": { "Service": "ec2.amazonaws.com" }, "Action": "sts:AssumeRole" }
  ]
}
~~~

Attach this trust policy to a role, attach a least-privilege permissions policy to the same role, then attach the role to the EC2 instance or Lambda function — code calling the AWS SDK picks up credentials automatically with no secrets to manage.

### RDS: Multi-AZ and read replicas

**RDS (Relational Database Service)** runs managed Postgres, MySQL, MariaDB, SQL Server, or Oracle. **Multi-AZ** keeps a synchronously replicated standby in a second AZ — AWS automatically fails over to it (typically 60–120 seconds) if the primary fails, with zero application changes beyond retrying the connection. **Read replicas** are asynchronously replicated copies used to offload read traffic — they do not provide automatic failover on their own (though a read replica can be promoted manually or via Aurora's faster mechanisms).

### Lambda essentials

~~~python
import json

def handler(event, context):
    # context.get_remaining_time_in_millis() lets you bail out before a timeout kills the invocation mid-write
    body = json.loads(event.get("body") or "{}")
    name = body.get("name", "world")
    return {"statusCode": 200, "body": json.dumps({"message": f"hello, {name}"})}
~~~

A Lambda function is packaged code plus a **trigger** (API Gateway, S3 event, SQS message, EventBridge schedule). **Cold starts** happen when AWS must initialize a new execution environment; **Provisioned Concurrency** keeps environments warm for latency-sensitive paths. **Layers** share common dependencies across functions without bundling them in every deployment package.

### ECS vs EKS vs Fargate — the container matrix

- **ECS (Elastic Container Service)**: AWS's own, simpler container orchestrator. Tasks and services defined in AWS-native JSON, tightly integrated with IAM, ALB, and CloudWatch.
- **EKS (Elastic Kubernetes Service)**: a managed Kubernetes control plane — use it when you need Kubernetes portability, its ecosystem (Helm, operators), or multi-cloud consistency. See the **Kubernetes** skill for the orchestration layer itself.
- **Fargate**: a serverless compute mode usable by *either* ECS or EKS — you define a task/pod, Fargate runs it without you provisioning or patching EC2 instances at all. Trade some cost and control for zero server management.

### Auto Scaling Groups (ASG)

~~~bash
aws autoscaling put-scaling-policy \\
  --auto-scaling-group-name app-asg \\
  --policy-name cpu-target-tracking \\
  --policy-type TargetTrackingScaling \\
  --target-tracking-configuration '{"TargetValue":60.0,"PredefinedMetricSpecification":{"PredefinedMetricType":"ASGAverageCPUUtilization"}}'
~~~

An ASG maintains a fleet of EC2 instances (or ECS tasks, via ECS-specific scaling) between a minimum and maximum count, scaling on a metric (CPU, request count per target, a custom CloudWatch metric).

### Infrastructure as code, briefly

AWS's native IaC tool is **CloudFormation** — YAML/JSON templates describing a "stack" of resources, applied idempotently.

~~~yaml
Resources:
  AppBucket:
    Type: AWS::S3::Bucket
    Properties:
      BucketName: my-app-bucket-2026
      PublicAccessBlockConfiguration:
        BlockPublicAcls: true
        BlockPublicPolicy: true
~~~

Most production teams today prefer the **Terraform** skill's HCL for multi-cloud consistency and a larger module ecosystem, but CloudFormation (and the CDK, which compiles TypeScript/Python into CloudFormation) remain common in AWS-only shops.

### S3 lifecycle, versioning, and encryption

~~~json
{
  "Rules": [
    { "ID": "archive-old-logs", "Status": "Enabled",
      "Filter": { "Prefix": "logs/" },
      "Transitions": [{ "Days": 30, "StorageClass": "GLACIER" }],
      "Expiration": { "Days": 365 } }
  ]
}
~~~

Enable **versioning** to protect against accidental overwrite/delete; enable **default encryption** (SSE-S3 or SSE-KMS) so every object is encrypted at rest without relying on the uploader to remember.
`,

  "advanced-concepts": `
### The Well-Architected Framework — a decision tool, not a checklist

AWS's Well-Architected Framework organizes every architectural decision into six pillars. Senior engineers use it as a structured way to find the gaps in a design review, not as a certificate to earn:

1. **Operational Excellence** — can you deploy, observe, and recover through automation, or does everything require a human doing manual steps under pressure?
2. **Security** — is access least-privilege, is data encrypted, is the blast radius of a compromised credential small?
3. **Reliability** — does the system self-heal from a failed instance, a failed AZ, a failed dependency?
4. **Performance Efficiency** — is the resource type (compute family, storage class, database engine) matched to the actual access pattern, and is that choice revisited as the workload evolves?
5. **Cost Optimization** — is spend visible (tagging, budgets) and is capacity matched to demand (autoscaling, Spot, right-sizing) rather than statically over-provisioned?
6. **Sustainability** (added 2021) — is compute utilization maximized (fewer, better-utilized, more efficient instances like Graviton) to minimize energy and carbon per unit of useful work?

### IAM policy evaluation logic

IAM's decision algorithm, precisely, matters at the senior level:

1. By default, every request is **implicitly denied**.
2. An **explicit Deny** anywhere in any applicable policy (identity-based, resource-based, permissions boundary, Service Control Policy) **always wins**, no matter how many Allows exist elsewhere.
3. Absent an explicit Deny, an **explicit Allow** in any applicable policy grants access.
4. **Permissions boundaries** cap what an identity-based policy can ever grant — used to let teams create their own roles without accidentally escalating privilege.
5. **Service Control Policies (SCPs)**, applied at the AWS Organizations level, cap what any policy in an entire account or organizational unit can grant — the top-level guardrail in multi-account setups.

### VPC advanced connectivity

- **VPC Peering**: a direct, non-transitive network connection between two VPCs — simple but does not scale past a handful of VPCs (peering is pairwise).
- **Transit Gateway**: a hub-and-spoke router connecting many VPCs and on-premises networks — the standard choice once you have more than a few VPCs to connect.
- **VPC Endpoints**: private connectivity to AWS services without traversing the public internet or a NAT Gateway. **Gateway endpoints** (S3, DynamoDB, free) attach directly to a route table; **Interface endpoints** (most other services, billed hourly) create an ENI with a private IP inside your subnet, backed by AWS PrivateLink.
- **PrivateLink**: the underlying technology letting a service in one VPC (yours or a vendor's) be consumed privately from another, without peering or exposing it to the internet.

### Multi-account strategy

At scale, a single AWS account per company is itself an anti-pattern — a single blast radius, a single set of service quotas, and no isolation between environments. **AWS Organizations** groups multiple accounts under central billing and SCPs; **Control Tower** automates the setup of a "landing zone": one account per environment (dev/staging/prod) or per team, a dedicated logging/security account, and guardrails applied uniformly.

### Serverless internals: the Lambda execution lifecycle

A Lambda invocation moves through three phases: **Init** (download code, start the runtime, run code outside your handler — this is where cold-start latency lives), **Invoke** (your handler runs, once per request in that environment), and **Shutdown** (the environment is frozen for reuse or eventually recycled). Understanding that an execution environment can serve **many sequential invocations** before shutdown explains why database connections, SDK clients, and caches should be initialized **outside** the handler function — reused across warm invocations instead of rebuilt every time.

### DynamoDB internals

DynamoDB partitions data by hashing the **partition key**; a **hot partition** (one key receiving disproportionate traffic) throttles regardless of overall table throughput, because throughput is provisioned/allocated per partition, not globally. **Global Secondary Indexes (GSIs)** allow querying by an alternate key at the cost of eventual consistency and additional write capacity; **Local Secondary Indexes (LSIs)** share the base table's partition key and must be created at table-creation time. DynamoDB defaults to eventually consistent reads (cheaper, faster) with an option for strongly consistent reads (double the read cost, single-region only).

### Aurora internals

Aurora decouples compute from a distributed, log-structured storage layer that replicates six copies of every write across three AZs, requiring only four of six copies to acknowledge a write and three of six to read — meaning Aurora tolerates losing an entire AZ plus one more copy without any data loss, and typically fails over to a replica in under 30 seconds versus RDS Multi-AZ's roughly 60–120.

### Resilience patterns at the SDK level

Production AWS SDK usage should implement **exponential backoff with jitter** on retryable errors (throttling, 5xx), **circuit breakers** around downstream calls that are failing consistently, and **bulkheads** (separate connection pools/thread pools per dependency) so one slow dependency cannot exhaust the resources needed to serve unrelated requests.

### Cross-region disaster recovery tiers

| Strategy | RTO | RPO | Cost |
|---|---|---|---|
| Backup and restore | Hours | Hours | Lowest |
| Pilot light (minimal standby, scaled up on failover) | ~10s of minutes | Minutes | Low |
| Warm standby (scaled-down live copy) | Minutes | Seconds–minutes | Medium |
| Multi-site active-active | Near-zero | Near-zero | Highest |
`,

  "internal-working": `
Understanding what actually happens when you launch an EC2 instance or read from S3 demystifies both AWS's guarantees and its failure modes.

~~~mermaid
flowchart LR
    A["aws ec2 run-instances (CLI/SDK/Console)"] --> B["IAM: authenticate + authorize the call"]
    B --> C["EC2 control plane: pick a physical host,\nallocate capacity, register metadata"]
    C --> D["Nitro hypervisor on the physical host\nboots a lightweight KVM-based VM"]
    D --> E["Nitro Card offloads networking + storage\nfrom the host CPU to dedicated hardware"]
    E --> F["Instance boots from the AMI,\nreceives a private IP + ENI"]
    F --> G["Instance reachable via VPC route tables\nand security groups"]
~~~

1. **Every API call goes through IAM first.** The control plane for every service checks the caller's identity and evaluates every applicable policy before doing anything else — this is why a correctly-scoped IAM policy is the single most load-bearing security control on the entire platform.
2. **The control plane and data plane are separate.** Launching, resizing, or deleting a resource (control plane) is a different, often slower and more failure-sensitive path than actually using it (data plane — an S3 GetObject, a running EC2 instance serving traffic). AWS's own outages disproportionately affect control planes; well-designed applications keep running on the data plane even if they temporarily can't make control-plane changes.
3. **The Nitro System** is the hardware/hypervisor architecture underlying almost all current-generation EC2 instances: a minimal KVM-based hypervisor plus dedicated offload cards handling networking, storage, and security functions outside the host CPU — the reason modern EC2 instances have near-bare-metal performance and a hypervisor attack surface small enough to formally verify.
4. **S3 durability** comes from redundantly storing every object across a minimum of three physical Availability Zones using erasure coding, with continuous background integrity checking (bit-rot detection and self-healing) — the mechanism behind the famous "11 nines" (99.999999999%) annual durability figure.
5. **Everything is eventually a distributed system problem.** DynamoDB's underlying design descends directly from Amazon's own 2007 Dynamo research paper — consistent hashing for partitioning, quorum reads/writes for consistency/availability tradeoffs, and vector clocks/version reconciliation for conflict resolution (see Research Papers).
`,

  architecture: `
A senior engineer separates AWS thinking into two layers: the **global/regional runtime topology** and the **application architecture** built on top of it.

### Runtime topology

~~~mermaid
flowchart TB
    subgraph Global["Global services"]
        IAM["IAM"]
        R53["Route 53 (DNS)"]
        CF["CloudFront (CDN)"]
        ORG["Organizations"]
    end
    subgraph Region["A single AWS Region"]
        subgraph AZa["Availability Zone A"]
            PubA["Public subnet"]
            PrivA["Private subnet"]
        end
        subgraph AZb["Availability Zone B"]
            PubB["Public subnet"]
            PrivB["Private subnet"]
        end
    end
    Global --> Region
~~~

IAM, Route 53, and CloudFront are **global** — one control plane serves every region. Nearly everything else (EC2, RDS, VPC, Lambda) is **regional**, and most services are further scoped to a single Availability Zone unless you explicitly design for multi-AZ.

### Reference application architecture

The standard three-tier layout underlying most production AWS services:

~~~text
Internet
   │
   ▼
Route 53 (DNS) → CloudFront (optional CDN/WAF edge)
   │
   ▼
Application Load Balancer          — public subnets, 2+ AZs
   │
   ▼
Compute tier (ECS/EKS/Fargate/EC2 ASG)   — private subnets, 2+ AZs
   │
   ▼
Data tier (RDS Multi-AZ, ElastiCache, DynamoDB)  — private subnets, 2+ AZs
~~~

Rules that hold across almost every well-run AWS account: only the load balancer (and, if used, a bastion/SSM-managed jump host) sits in a public subnet; compute and data always sit in private subnets reachable only from inside the VPC; every tier spans at least two AZs; and outbound internet access from private subnets goes through a NAT Gateway, never a direct route.
`,

  "data-flow": `
Tracing one HTTP request through a typical production AWS deployment — an API request hitting a FastAPI service behind an ALB, backed by RDS:

~~~mermaid
sequenceDiagram
    participant User
    participant R53 as Route 53
    participant ALB as Application Load Balancer
    participant SG as Security Group
    participant App as ECS/Fargate task (FastAPI)
    participant RDS as RDS Postgres (Multi-AZ)
    participant CW as CloudWatch

    User->>R53: resolve api.example.com
    R53-->>User: ALB's IP addresses
    User->>ALB: HTTPS request
    ALB->>SG: forward to target on app port
    SG-->>ALB: allowed (source = ALB security group)
    ALB->>App: HTTP request to healthy target
    App->>RDS: SQL query (private subnet, DB security group)
    RDS-->>App: rows
    App-->>ALB: JSON response
    ALB-->>User: HTTPS response
    App--)CW: structured logs + metrics (async)
~~~

What each hop enforces: Route 53 resolves the domain and can also perform health-check-based failover across regions; the ALB terminates TLS and only forwards to instances/tasks that pass its own health checks; the security group on the application tier explicitly allows traffic **only** from the ALB's security group (not from 0.0.0.0/0); the database's security group in turn allows traffic **only** from the application tier's security group — nothing on the internet can reach the database directly, even if someone discovers its private IP. This chained, least-privilege security-group design (each tier only accepts traffic from the specific tier that should call it) is the backbone of AWS network security and the exact model tested in the worked example below.
`,

  "production-usage": `
### Provisioning: tooling and config

Production AWS accounts are almost never configured by hand in the console. The standard toolchain: infrastructure defined in the **Terraform** skill's HCL (or CloudFormation/CDK in AWS-heavy shops), applied through a CI/CD pipeline (see the **CI/CD** and **GitHub Actions** skills) with a plan/review/apply gate, secrets pulled from **Secrets Manager** or **Systems Manager Parameter Store** at runtime rather than baked into images or environment files, and every resource tagged with at minimum: environment, owner/team, cost-center, and application name.

### Project/account layout

A mature setup uses **AWS Organizations** with separate accounts per environment (dev, staging, prod) and a dedicated logging/security account, connected via Transit Gateway or VPC peering where cross-account traffic is genuinely required — isolating blast radius so a mistake in dev cannot touch production resources or IAM.

### Operational defaults real teams hold as non-negotiable

- Every stateful service (RDS, ElastiCache with cluster mode) runs Multi-AZ in production; single-AZ is reserved for dev/staging.
- Auto Scaling Groups and ECS services always specify a minimum of 2 instances/tasks across 2+ AZs — never a single point of failure "temporarily."
- CloudTrail is enabled account-wide, logging to a separate, restricted-access account, so an attacker who compromises a workload account cannot also erase the audit trail.
- AWS Config rules and Security Hub run continuously, flagging drift from approved baselines (public buckets, unencrypted volumes, security groups open to 0.0.0.0/0 on sensitive ports).
- Budgets and Cost Anomaly Detection are configured before the first resource is provisioned, not after the first surprising bill.
`,

  "industry-examples": `
- **Netflix**: one of AWS's largest and longest-running customers; famously built Chaos Monkey and the wider Simian Army to continuously kill production instances and validate that its multi-AZ, multi-region architecture actually survives failure rather than merely being designed to. Netflix's cost engineering (Reserved Instances/Savings Plans at massive scale, Spot for encoding workloads) is also widely referenced.
- **Capital One**: an early "cloud-first" bank that moved core banking workloads off its own data centers onto AWS — also the subject of a major 2019 breach used industry-wide as a teaching case study on SSRF and IAM over-permissioning (see Case Studies).
- **NASA/JPL**: used AWS to process and distribute imagery from the Mars rover missions to the public in near-real time, an example of bursty, unpredictable-demand workloads that would be wasteful to provision for on owned hardware.
- **Slack**: runs its core messaging infrastructure on AWS, relying heavily on multi-AZ RDS/Aurora and SQS-based asynchronous processing to handle bursty, globally distributed traffic.
- **Epic Games (Fortnite)**: uses AWS to absorb enormous, unpredictable spikes in concurrent players around content drops and live events — a canonical elastic-scaling use case.
- **Airbnb**: runs the majority of its infrastructure on AWS, including heavy use of S3 for media storage and a large-scale data platform for search/pricing/trust-and-safety models.

The pattern across all of them: none treat AWS as "someone else's computer to click around in" — each has deep automation (IaC, autoscaling policies, chaos testing) turning AWS's raw elasticity into an operational advantage.
`,

  "best-practices": `
1. **Apply least privilege to every IAM identity.** Start from zero permissions and add only what's proven necessary; avoid "Action: *" and "Resource: *" except in genuinely break-glass administrative roles.
2. **Use IAM roles for compute, never long-lived access keys.** EC2 instance profiles and Lambda execution roles provide automatically rotated, temporary credentials — an embedded access key is a permanent liability the moment it's committed anywhere.
3. **Default to Multi-AZ for every stateful production resource.** A single-AZ database is a scheduled outage waiting for an AZ-level event.
4. **Tag every resource on creation** (environment, owner, cost-center, application) — untagged resources are invisible to cost allocation, automated cleanup, and incident attribution.
5. **Provision everything through code** (Terraform/CloudFormation), never through console clicks in production — see the **Terraform** skill. Manual changes drift from the source of truth and can't be code-reviewed.
6. **Encrypt at rest and in transit by default** — enable default EBS/S3 encryption account-wide and enforce TLS on every load balancer listener; don't rely on individual engineers remembering per-resource.
7. **Use VPC endpoints for AWS-service traffic from private subnets** — S3/DynamoDB gateway endpoints are free and remove that traffic from the NAT Gateway entirely, cutting both cost and public-internet exposure.
8. **Right-size compute using data, not guesses** — use Compute Optimizer and CloudWatch utilization metrics; a fleet running at 15% CPU utilization is a cost bug, not "healthy headroom."
9. **Set Budgets and Cost Anomaly Detection before, not after, provisioning** — a five-minute setup step that catches the single most common "surprise AWS bill" story.
10. **Separate environments into different AWS accounts** via Organizations, not just different VPCs in one account — blast radius and IAM boundaries matter more than convenience.
11. **Prefer managed services over self-hosted equivalents** for anything that isn't your core differentiator — a managed Postgres (RDS/Aurora) beats a self-managed EC2 database in almost every real scenario.
12. **Enable CloudTrail, Config, and GuardDuty account-wide from day one** — retrofitting audit and threat-detection tooling after an incident is far harder than starting with it on.
`,

  "anti-patterns": `
### Public S3 bucket via a permissive bucket policy

~~~json
// WRONG — anyone on the internet can read every object
{
  "Version": "2012-10-17",
  "Statement": [
    { "Effect": "Allow", "Principal": "*", "Action": "s3:GetObject",
      "Resource": "arn:aws:s3:::my-app-bucket/*" }
  ]
}
~~~

~~~json
// RIGHT — private by default, access only via a scoped IAM role or presigned URL,
// with account-level Block Public Access enabled as a backstop
{
  "Version": "2012-10-17",
  "Statement": [
    { "Effect": "Allow", "Principal": { "AWS": "arn:aws:iam::123456789012:role/app-service-role" },
      "Action": "s3:GetObject", "Resource": "arn:aws:s3:::my-app-bucket/*" }
  ]
}
~~~

### Overly broad IAM policy

~~~json
// WRONG — a single leaked credential now controls the entire account
{ "Version": "2012-10-17", "Statement": [{ "Effect": "Allow", "Action": "*", "Resource": "*" }] }
~~~

~~~json
// RIGHT — scoped to the exact actions and resources the workload needs
{ "Version": "2012-10-17", "Statement": [
    { "Effect": "Allow", "Action": ["dynamodb:GetItem", "dynamodb:PutItem"],
      "Resource": "arn:aws:dynamodb:us-east-1:123456789012:table/orders" } ] }
~~~

### Hardcoded credentials

~~~python
# WRONG — a leaked key here is a leaked key forever, and it's now in your git history
client = boto3.client("s3", aws_access_key_id="AKIA...", aws_secret_access_key="...")
~~~

~~~python
# RIGHT — the SDK picks up temporary credentials from the instance/task role automatically
client = boto3.client("s3")
~~~

### Single-AZ database in production

~~~text
WRONG: db.t3.medium, Multi-AZ = No  → one AZ failure is one outage
RIGHT: db.t3.medium, Multi-AZ = Yes → AWS fails over to a synced standby automatically
~~~

### Other production-grade anti-patterns

- **Using the root account for daily work** — it should be locked behind MFA, used only for the handful of actions that genuinely require it, with day-to-day work done via IAM roles.
- **Security groups open to 0.0.0.0/0 on SSH (22) or RDP (3389)** — use Session Manager or a bastion with a scoped source IP instead.
- **No tagging strategy** — untagged resources become impossible to cost-attribute or safely automate cleanup for.
- **Treating a region as if it never fails** — designing as if a single region, or even a single service's control plane, is infallible.
- **Storing state (sessions, uploaded files) on local instance disk** — instances are ephemeral; use S3/Redis/RDS for anything that must survive an instance replacement.
`,

  performance: `
### Measure first

~~~bash
# CloudWatch: the default source of truth for utilization and latency
aws cloudwatch get-metric-statistics --namespace AWS/EC2 --metric-name CPUUtilization \\
  --dimensions Name=InstanceId,Value=i-0123456789abcdef0 \\
  --start-time 2026-07-18T00:00:00Z --end-time 2026-07-19T00:00:00Z \\
  --period 3600 --statistics Average

# AWS Compute Optimizer: automated right-sizing recommendations based on real usage
aws compute-optimizer get-ec2-instance-recommendations --instance-arns arn:aws:ec2:...
~~~

**AWS X-Ray** traces a request across service boundaries (ALB → Lambda → DynamoDB, for example) and shows exactly which hop dominates latency — the equivalent of a distributed profiler for AWS-native architectures.

### The optimization hierarchy (apply in order)

1. **Choose the right architecture first.** A managed service matched to the access pattern (DynamoDB for key-value lookups at scale, Aurora for relational joins) outperforms any amount of tuning on the wrong primitive.
2. **Cache aggressively.** CloudFront in front of static/cacheable content, ElastiCache (Redis/Memcached) in front of a database — often a 10–100x latency reduction for read-heavy paths at a fraction of the database's cost.
3. **Right-size compute using real utilization data.** Moving from an over-provisioned m6i.2xlarge running at 10% CPU to an appropriately sized instance (or a Graviton equivalent) is frequently both cheaper and just as fast.
4. **Prefer Graviton (ARM) instance families where your software supports them.** AWS reports meaningfully better price-performance than equivalent x86 instances for many workloads — verify with your own benchmark, but it is the default starting point for new deployments.
5. **Tune for cold starts on Lambda** where latency-sensitive: smaller deployment packages, fewer/smaller dependencies, Provisioned Concurrency for user-facing paths with strict latency SLAs.
6. **Use enhanced networking / placement groups** for the small minority of workloads that are genuinely network-bandwidth or inter-instance-latency bound (HPC, tightly-coupled distributed training).
7. **Push work off the request path.** Anything that doesn't need to complete before responding to the user (embeddings generation, email sending, video transcoding) belongs in SQS + a worker fleet, not inline in the request handler.
`,

  scalability: `
AWS's scaling story is fundamentally **horizontal**: add more of a stateless resource behind a load balancer rather than making one resource bigger indefinitely, though vertical scaling (a bigger instance type) remains the fastest fix for a database that hasn't yet outgrown a single primary.

~~~mermaid
flowchart LR
    R53["Route 53"] --> ALB["ALB (multi-AZ)"]
    ALB --> ASG1["Task/instance (AZ-a)"]
    ALB --> ASG2["Task/instance (AZ-b)"]
    ALB --> ASG3["Task/instance (AZ-c)"]
    ASG1 & ASG2 & ASG3 --> Cache[("ElastiCache Redis")]
    ASG1 & ASG2 & ASG3 --> DB[("Aurora / RDS Multi-AZ\n+ read replicas")]
~~~

### Vertical vs horizontal

- **Vertical**: resize an RDS instance class, a single EC2 instance, or an ElastiCache node — simple, but bounded by the largest instance type that exists, and requires a brief interruption or failover.
- **Horizontal**: add more ASG instances, more ECS/EKS replicas, more DynamoDB partitions — effectively unbounded, but requires the application tier to be stateless (session/state externalized to Redis/DynamoDB, not held in a server's memory).

### Known bottlenecks and their answers

| Bottleneck | Answer |
|---|---|
| Database connection exhaustion under high replica/worker count | RDS Proxy or PgBouncer-style connection pooling in front of Postgres |
| NAT Gateway bandwidth/cost at scale | VPC endpoints for AWS-service traffic; NAT Gateway per AZ to avoid cross-AZ data transfer |
| Lambda concurrency limits (account/region-level) | Request a limit increase; move very high-throughput steady workloads to Fargate/ECS |
| DynamoDB hot partition | Better partition-key design (higher cardinality); write-sharding a hot key with a random suffix |
| Single-region latency for global users | CloudFront for static/cacheable content; multi-region active-active for latency-critical dynamic APIs |
| ALB/NLB request ceiling on one target | Auto Scaling target-tracking policy keyed on RequestCountPerTarget, not just CPU |
`,

  security: `
### AWS-specific attack surface

1. **Public S3 buckets** remain one of the most common real-world breach vectors — a misconfigured bucket policy or ACL exposing customer data or backups to the internet. Account-level **S3 Block Public Access** should be enabled as a default backstop, not just per-bucket settings.
2. **Overly broad IAM policies** turn any single leaked credential (a CI token, a compromised laptop) into full account compromise. Use IAM Access Analyzer to find unused permissions and unintended public/cross-account access.
3. **SSRF against the EC2 Instance Metadata Service (IMDS)** — an application vulnerable to server-side request forgery can be tricked into fetching the instance's IAM credentials from the metadata endpoint. **IMDSv2** (session-oriented, requires a PUT token) closes this specific vector and should be enforced account-wide; see Case Studies for the incident that made this mainstream.
4. **Security groups open to 0.0.0.0/0** on administrative ports (22, 3389) or database ports are an immediately exploitable exposure — restrict to specific IPs, a bastion, or use Session Manager instead of exposing SSH at all.
5. **Leaked long-lived access keys** committed to a public git repository — automated scanners (including AWS's own) find these within minutes; rotate immediately and prefer roles over keys everywhere possible.
6. **Unencrypted data at rest** (EBS volumes, RDS instances, S3 buckets created before default encryption was enabled) — audit with AWS Config rules and remediate.

### Defenses

- **GuardDuty**: continuous, ML-assisted threat detection across CloudTrail, VPC Flow Logs, and DNS logs — flags things like credential exfiltration attempts and crypto-mining patterns.
- **Security Hub**: aggregates findings from GuardDuty, Config, Inspector, and third-party tools into one prioritized view against standards like CIS AWS Foundations.
- **AWS Config**: continuously evaluates resources against rules ("no security group should allow 0.0.0.0/0 on port 22") and can auto-remediate.
- **WAF and Shield**: WAF filters HTTP(S) requests to an ALB/CloudFront/API Gateway against rules (SQLi, XSS, rate-based rules); Shield provides DDoS protection (Standard is automatic and free, Advanced adds larger-scale protection and support).
- **KMS**: manages encryption keys used by S3, EBS, RDS, and most other services; supports customer-managed keys with fine-grained key policies for organizations needing that control.

For the request-handling code itself, see the platform's dedicated **SQL Injection** and **OWASP Top 10** skills; for how secrets should actually be stored and rotated, see the **Secrets Management** skill; for container-specific attack surface on ECS/EKS, see the **Docker** and **Kubernetes** skills.
`,

  testing: `
### Testing infrastructure code

~~~python
# Using moto to mock AWS services in unit tests — no real account or network calls
import boto3
from moto import mock_aws

@mock_aws
def test_uploads_are_stored_under_the_expected_prefix():
    s3 = boto3.client("s3", region_name="us-east-1")
    s3.create_bucket(Bucket="test-bucket")

    upload_report(s3, bucket="test-bucket", user_id=42, content=b"hello")

    keys = [o["Key"] for o in s3.list_objects_v2(Bucket="test-bucket")["Contents"]]
    assert keys == ["reports/42/report.txt"]
~~~

**moto** intercepts boto3 calls in-process, giving fast, deterministic unit tests for code that touches S3/DynamoDB/SQS/etc. without any network access or real AWS account.

### Testing infrastructure definitions

~~~python
# Terraform: run "terraform plan" in CI and assert on the plan JSON,
# or use a dedicated framework (Terratest, in Go) for real apply/destroy integration tests
# against an ephemeral test account.
~~~

For CloudFormation/CDK, unit-test the synthesized template's structure (does this stack always attach the expected IAM policy, always enable encryption) using the CDK's own assertions library, and integration-test by actually deploying to a disposable sandbox account and tearing it down.

### The senior testing doctrine for cloud infrastructure

- Unit-test **application logic** with mocked AWS clients (moto, or hand-rolled fakes behind a repository interface) — fast, no AWS dependency.
- Integration-test the **real infrastructure** against an ephemeral sandbox account created and destroyed per CI run — this is the only way to catch real IAM permission gaps, real security group misconfigurations, and real service quota issues.
- Use the **IAM Policy Simulator** (or aws iam simulate-principal-policy) to verify a policy grants exactly the intended actions before attaching it to a production role.
- Chaos-test resilience claims with **AWS Fault Injection Simulator** — actually kill an AZ's worth of instances or inject latency, rather than trusting the architecture diagram.
- Load-test with a tool like Locust or k6 against a staging environment sized like production, to find the real ceiling (connection pool exhaustion, ALB/NLB limits, DynamoDB throttling) before customers do.
`,

  debugging: `
### The escalation path, in order

1. **CloudWatch Logs Insights** — query application and service logs with a purpose-built query language; usually the fastest way to find "what error, how often, since when."

~~~text
fields @timestamp, @message
| filter @message like /ERROR/
| sort @timestamp desc
| limit 50
~~~

2. **AWS X-Ray** — trace a slow or failing request end-to-end across service boundaries to see exactly which downstream call (database, another Lambda, an external API) is the actual culprit, rather than guessing from aggregate metrics.
3. **VPC Flow Logs** — when the symptom is "can't connect" rather than "connected but errored," Flow Logs show whether traffic was ACCEPTed or REJECTed at the security-group/NACL layer, and by which rule.
4. **VPC Reachability Analyzer** — answers "why can't resource A reach resource B" by statically analyzing route tables, security groups, and NACLs between two points, without generating any real traffic.
5. **CloudTrail** — for "who changed this and when," the account-wide audit log of every API call, including console actions — the first place to look after an unexplained configuration change or a security incident.
6. **AWS Support / Personal Health Dashboard** — for suspected AWS-side issues (a service disruption, a capacity constraint), check the Health Dashboard before assuming the bug is in your own code.

### Debugging Lambda specifically

- Enable **active tracing** (X-Ray) to see Init/Invoke phase timing separately — distinguishes a genuine cold-start problem from a slow handler.
- A function stuck at "Task timed out" almost always means a downstream call without its own timeout, blocking until the Lambda's own timeout kills the whole invocation.
- CloudWatch Logs are per-invocation and per-concurrent-execution — under load, correlate by the request ID present in every log line, not just by timestamp.
`,

  monitoring: `
Production AWS observability rests on the same three pillars as any other production system, instrumented with AWS-native tooling.

### Metrics and alarms (CloudWatch)

~~~python
import boto3

cloudwatch = boto3.client("cloudwatch")

cloudwatch.put_metric_data(
    Namespace="MyApp/Orders",
    MetricData=[{
        "MetricName": "OrdersProcessed",
        "Value": 1,
        "Unit": "Count",
        "Dimensions": [{"Name": "Environment", "Value": "production"}],
    }],
)
~~~

~~~bash
aws cloudwatch put-metric-alarm \\
  --alarm-name high-error-rate \\
  --metric-name 5XXError --namespace AWS/ApplicationELB \\
  --statistic Sum --period 60 --threshold 10 \\
  --comparison-operator GreaterThanThreshold --evaluation-periods 3 \\
  --alarm-actions arn:aws:sns:us-east-1:123456789012:ops-alerts
~~~

Track the **RED** trio (Rate, Errors, Duration p50/p95/p99) per endpoint on the ALB and application side, and alert on symptoms customers feel (error rate, p99 latency) rather than raw causes (CPU) alone.

### Logs

Ship structured (JSON) application logs to CloudWatch Logs (or forward to an ELK/Loki stack) with a correlation/request ID on every line; set log retention explicitly (default is "never expire," which quietly accumulates cost).

### Traces

X-Ray (or an OpenTelemetry collector exporting to X-Ray or a third-party APM) instruments FastAPI, boto3 calls, and SQL queries with two-line setup in most frameworks, giving span-level visibility into where a request actually spent its time across services.

### AWS-specific things to watch

- **Throttling metrics** (DynamoDB, Lambda concurrency, API Gateway) — a rising throttle count is an early warning of a capacity ceiling, not just a transient blip.
- **NAT Gateway bytes processed** — a silent, easy-to-miss cost driver that also signals architectural issues (private-subnet resources talking to AWS services without a VPC endpoint).
- **RDS/Aurora replica lag** — read replicas serving stale data past an acceptable threshold is a correctness bug, not just a performance one.
- **GuardDuty and Security Hub findings** — wire these into the same alerting pipeline as operational alarms; a security finding is an incident, not a backlog item.
`,

  deployment: `
### A production-grade ECS Fargate task definition

~~~json
{
  "family": "orders-api",
  "networkMode": "awsvpc",
  "requiresCompatibilities": ["FARGATE"],
  "cpu": "512",
  "memory": "1024",
  "executionRoleArn": "arn:aws:iam::123456789012:role/ecsTaskExecutionRole",
  "taskRoleArn": "arn:aws:iam::123456789012:role/orders-api-task-role",
  "containerDefinitions": [
    {
      "name": "orders-api",
      "image": "123456789012.dkr.ecr.us-east-1.amazonaws.com/orders-api:latest",
      "portMappings": [{ "containerPort": 8000, "protocol": "tcp" }],
      "healthCheck": {
        "command": ["CMD-SHELL", "curl -f http://localhost:8000/healthz || exit 1"],
        "interval": 30, "timeout": 5, "retries": 3
      },
      "logConfiguration": {
        "logDriver": "awslogs",
        "options": {
          "awslogs-group": "/ecs/orders-api",
          "awslogs-region": "us-east-1",
          "awslogs-stream-prefix": "orders-api"
        }
      },
      "secrets": [
        { "name": "DATABASE_URL", "valueFrom": "arn:aws:secretsmanager:us-east-1:123456789012:secret:orders-db-url" }
      ]
    }
  ]
}
~~~

Why each choice matters: **awsvpc network mode** gives the task its own ENI and security group (fine-grained network isolation per task, not shared with the host); the **executionRoleArn** (pulls the image, writes logs, reads secrets) is deliberately separate from the **taskRoleArn** (what the application code itself can do) — least privilege split at the right seam; the **healthCheck** lets ECS replace unhealthy tasks automatically; **secrets pulled from Secrets Manager at launch**, never baked into the image or passed as plain environment variables; **logs shipped to CloudWatch** with a per-service stream prefix for easy filtering.

### Serving topology

- **ECS/EKS on Fargate**: the cloud-native default for most new services — no EC2 patching, scale by adjusting desired task count.
- **ECS/EKS on EC2**: chosen when you need GPU instances, very high task density per host for cost reasons, or specific instance-level control Fargate doesn't expose.
- Deploy behind an **ALB** with a target group per service, using rolling or blue/green deployments (CodeDeploy, or your CI/CD tool's native ECS deploy action) to avoid downtime.

### CI/CD pipeline shape

lint/test → build container image → push to ECR → scan image for CVEs → deploy to staging → smoke test → deploy to production with a rolling or blue/green strategy → automatic rollback on failed health checks. See the **CI/CD**, **GitHub Actions**, and **Jenkins** skills for the pipeline mechanics, and the **Terraform** skill for provisioning the ECS service/ALB/target group definitions this pipeline deploys into.
`,

  "production-checklist": `
Before an AWS-hosted service takes real production traffic:

- [ ] Every stateful resource (RDS/Aurora, ElastiCache) is Multi-AZ
- [ ] Compute (ASG/ECS/EKS service) has a minimum of 2 instances/tasks spread across 2+ AZs
- [ ] IAM roles are least-privilege, reviewed with IAM Access Analyzer, and no long-lived keys are embedded in code or images
- [ ] S3 Block Public Access is enabled account-wide; buckets are private unless explicitly and deliberately public
- [ ] Every resource is tagged (environment, owner, cost-center, application)
- [ ] Default encryption at rest is enabled for EBS, S3, and RDS; TLS is enforced on every load balancer listener
- [ ] Security groups follow least privilege — no 0.0.0.0/0 on SSH/RDP/database ports
- [ ] CloudTrail is enabled account-wide, logging to a separate restricted account
- [ ] CloudWatch alarms exist for error rate, p95/p99 latency, and resource saturation, wired to a real on-call channel
- [ ] AWS Budgets and Cost Anomaly Detection are configured with alert thresholds
- [ ] GuardDuty and Security Hub are enabled and their findings feed the same alerting pipeline as operational alerts
- [ ] Backups are automated (RDS automated backups/snapshots) and a restore has actually been tested, not just assumed to work
- [ ] Secrets come from Secrets Manager/Parameter Store, never from plain environment variables baked into an image
- [ ] Infrastructure is defined in code (Terraform/CloudFormation) and applied through CI, not console clicks
- [ ] A documented runbook exists for scaling up, rolling back a deployment, and reading the primary dashboards
- [ ] Service quotas relevant to expected peak load (Lambda concurrency, EC2 vCPU limits) have been checked and increased proactively
`,

  "common-mistakes": `
1. **Leaving a database or cache single-AZ "temporarily"** — temporary configurations become permanent the moment nobody's watching, and the AZ failure arrives on its own schedule, not yours.
2. **Attaching AdministratorAccess to a role "to unblock development"** — the fastest way to lose track of what a service actually needs, and the reason a single leaked credential can compromise an entire account.
3. **Forgetting that S3 is not a filesystem** — treating "directories" as real and building logic that assumes atomic directory renames or listings that scale to millions of keys without pagination.
4. **Not setting a NAT Gateway per AZ** — routing all private-subnet outbound traffic through one AZ's NAT Gateway creates both a single point of failure and unnecessary cross-AZ data transfer charges.
5. **Ignoring service quotas until they're hit in production** — default Lambda concurrency, EC2 vCPU limits, and VPC limits are all real ceilings that should be checked against expected peak load ahead of time.
6. **Treating Reserved Instances/Savings Plans as "set and forget"** — workloads shift; unreviewed commitments become either wasted spend (overcommitted) or a missed discount opportunity (undercommitted).
7. **Using the default VPC in production** — it exists for quick starts, not for a deliberately designed network with the isolation a production workload needs.
8. **Not testing IAM policies before attaching them** — assuming a hand-written policy does what you intended, rather than verifying with the IAM Policy Simulator.
9. **Storing session state or uploaded files on local instance disk** — instances are ephemeral (an ASG can terminate and replace one at any time); anything that must survive belongs in S3, DynamoDB, or Redis.
10. **No tagging discipline from day one** — retrofitting tags onto hundreds of existing resources for cost allocation or automated cleanup is far more expensive than tagging at creation time.
`,

  "common-errors": `
| Error | Typical cause | Fix |
|---|---|---|
| AccessDenied | IAM policy doesn't grant the action/resource, or an explicit Deny elsewhere wins | Use IAM Policy Simulator; check SCPs and permissions boundaries, not just the identity policy |
| Throttling / ProvisionedThroughputExceededException | Request rate exceeds the resource's provisioned capacity (DynamoDB partition, Lambda concurrency) | Exponential backoff with jitter; re-examine partition key design or request a limit increase |
| InsufficientInstanceCapacity | The requested instance type/AZ combination has no capacity available right now | Retry with a different AZ or instance type; use an ASG with multiple instance types/subnets |
| DependencyViolation (deleting a VPC/subnet) | Another resource (ENI, NAT Gateway, security group reference) still depends on it | Delete dependent resources first, or use IaC destroy ordering (Terraform handles this automatically) |
| InvalidParameterValue: security group does not exist in VPC | Security group ID from one VPC referenced in a resource in a different VPC | Reference security groups only within the same VPC as the resource |
| RequestLimitExceeded | Too many API calls to a service's control plane in a short window | Implement backoff; batch calls where the API supports it; check for a retry loop bug |
| UnauthorizedOperation / not authorized to perform sts:AssumeRole | The role's trust policy doesn't allow the calling principal to assume it | Check the role's trust policy Principal, not just its permissions policy |
| CredentialsError / Unable to locate credentials | No IAM role attached and no credentials configured in the environment | Attach an instance profile/execution role, or run aws configure for local development only |
| Health check failing on ALB target | Application not listening on the expected port/path, or slow startup exceeding the health check's grace period | Verify the health check path/port matches the app; increase the startup grace period |
| Signature expired / SignatureDoesNotMatch | System clock skew on the calling machine, or a stale presigned URL | Sync system time (NTP); regenerate the presigned URL — they expire by design |
`,

  faqs: `
**Q: Is AWS always cheaper than running your own data center?**
Not automatically — at very large, stable, predictable scale, owning hardware can be cheaper (Dropbox's storage repatriation is the canonical counterexample; see Case Studies). AWS wins decisively for variable, unpredictable, or growing workloads, and for teams that would rather pay for elasticity than hire a data-center operations team.

**Q: Should I always use Multi-AZ?**
For anything stateful in production, yes — the incremental cost is small relative to the cost of an outage. Single-AZ is acceptable for dev/staging environments where a brief outage is a non-event.

**Q: Lambda, ECS/EKS, or EC2 — how do I choose?**
Lambda for event-driven, bursty, or infrequent workloads where you don't want to manage any servers and can tolerate cold starts. ECS/EKS (optionally on Fargate) for steady-state services, long-running processes, or anything needing more control over the runtime than Lambda allows. EC2 directly when you need full OS control, specialized hardware (GPUs with specific driver requirements), or licensing that doesn't fit a managed abstraction.

**Q: What's the real difference between a security group and a NACL?**
Security groups are stateful (return traffic is automatically allowed) and attach to instances/ENIs; NACLs are stateless (you must explicitly allow both directions) and attach to subnets. In practice, security groups do almost all the real work; NACLs are a coarse, secondary layer.

**Q: Are Reserved Instances obsolete now that Savings Plans exist?**
Mostly, for compute — Savings Plans offer similar discounts with more flexibility across instance families and even compute types (EC2, Fargate, Lambda). Reserved Instances remain relevant for RDS/ElastiCache/Redshift, which don't have a Savings Plan equivalent.

**Q: How do I avoid a surprise AWS bill?**
Set a Budget with an alert threshold before provisioning anything, enable Cost Anomaly Detection, tag every resource so cost is attributable, and review Cost Explorer weekly during active development — most surprise bills come from forgotten resources (an idle NAT Gateway, an oversized RDS instance), not from a single dramatic mistake.

**Q: Does this platform's own stack (FastAPI, Postgres, Redis) map cleanly onto AWS?**
Yes — see Architecture Diagram for the exact mapping: FastAPI containers on ECS/EKS Fargate behind an ALB, Postgres on RDS or Aurora (Multi-AZ), and Redis on ElastiCache. It's a close, idiomatic fit precisely because AWS's managed-database and managed-container services were designed around exactly this shape of application.

**Q: Do I need to learn every AWS service?**
No. A working fluency in roughly 15–20 services (covered across Beginner through Advanced Concepts here) handles the overwhelming majority of real production architectures; the rest of the 200+ services are situational tools you learn when a specific problem calls for them.
`,

  "interview-questions": `
**Junior/Mid:**

1. *What's the difference between an IAM user and an IAM role?* A user is a long-lived identity with permanent credentials, typically for a person; a role is an identity assumed temporarily (by a person, or by an AWS service like EC2 or Lambda) that provides short-lived, auto-rotated credentials — the recommended pattern for applications.
2. *Explain the difference between a security group and a NACL.* Security groups are stateful and instance/ENI-scoped, allow-only; NACLs are stateless and subnet-scoped, support both allow and deny, evaluated in numbered order. Security groups do most of the real work in practice.
3. *What is the shared responsibility model?* AWS is responsible for the security **of** the cloud (physical data centers, hypervisor, managed-service internals); the customer is responsible for security **in** the cloud (IAM configuration, data encryption choices, security group rules, patching their own EC2 OS if unmanaged).
4. *When would you choose Lambda over EC2?* Event-driven or bursty workloads with no need for a persistent process, where you want zero server management and pay only per invocation; EC2 wins when you need full OS control, long-running processes, specialized hardware, or predictable steady-state load where always-on compute is cheaper.
5. *What does an Application Load Balancer do that an EC2 instance alone cannot?* Distributes traffic across multiple healthy targets across multiple AZs, terminates TLS centrally, performs health checks and removes unhealthy targets automatically, and enables path/host-based routing to multiple backend services.

**Senior:**

6. *Walk through the IAM policy evaluation logic.* Default deny; explicit Deny in any applicable policy (identity, resource, permissions boundary, SCP) always wins; absent a Deny, an explicit Allow in any applicable policy grants access; permissions boundaries and SCPs act as caps on what identity policies can ever grant, not grants themselves. Strong answers mention that this is why "why is this denied despite an Allow" debugging always starts by searching for a Deny somewhere else in the chain.
7. *Design a highly available, cost-conscious architecture for a bursty API workload.* ALB across 2+ AZs, ECS/EKS on Fargate (or Lambda if truly event-driven) auto-scaling on request count, RDS/Aurora Multi-AZ with a read replica if read-heavy, ElastiCache for hot-path caching, CloudFront if there's cacheable/static content, Spot or Savings Plans for the predictable baseline portion of compute. Strong answers explicitly discuss the cost/availability tradeoff at each layer.
8. *How would you diagnose "the database is fine, the application is fine, but requests time out intermittently"?* Check security groups and NACLs (a stateful group misconfiguration can intermittently drop only certain traffic patterns), check connection pool exhaustion against the database's max_connections, check NAT Gateway or ENI limits, and use VPC Flow Logs plus Reachability Analyzer to find where packets are actually being dropped rather than guessing from the application layer alone.
9. *Explain how you'd structure a multi-account AWS Organization for a mid-size company.* Separate accounts per environment (dev/staging/prod) plus a dedicated logging/security account and a shared-services account; SCPs enforced at the OU level as guardrails (deny leaving certain regions, deny disabling CloudTrail); Control Tower or a hand-rolled landing zone to automate new-account baselines; cross-account access via roles, never shared long-lived credentials.
10. *DynamoDB is throttling on one specific key even though the table's overall provisioned throughput looks fine — why, and what do you do?* Throughput is allocated per partition, and a hot partition key (low cardinality, or a naturally skewed access pattern) can throttle independent of the table-wide numbers. Fix by improving key cardinality, write-sharding the hot key with a random suffix, or switching to on-demand capacity mode if the access pattern is unpredictable.
11. *A Lambda function intermittently takes 10x longer than usual — what are your hypotheses, and how do you confirm each?* Cold starts (confirm via X-Ray Init segment duration — fix with Provisioned Concurrency or a smaller package), a slow downstream dependency without its own timeout (confirm via X-Ray subsegments — fix by adding a timeout and circuit breaker), or throttling on a downstream resource (confirm via CloudWatch throttle metrics on the dependency).
12. *How do you prevent a repeat of an SSRF-driven IAM credential theft incident like Capital One's 2019 breach?* Enforce IMDSv2 account-wide (blocks the simplest SSRF-to-credential-theft path), scope the instance/task's IAM role to only what it needs (so even a successful theft yields minimal access), run a WAF in front of internet-facing applications, and monitor GuardDuty for anomalous credential usage patterns from an unexpected source.
`,

  "coding-questions": `
### 1. Find and report public S3 buckets across an account (boto3)

~~~python
import boto3

def find_public_buckets(s3_client) -> list[str]:
    """Return bucket names that are publicly accessible via policy or ACL.

    Uses S3's own public-access evaluation (get_bucket_policy_status) rather than
    re-implementing ACL/policy parsing by hand — that logic is subtle and AWS
    already exposes the resolved answer.
    """
    public_buckets = []
    for bucket in s3_client.list_buckets()["Buckets"]:
        name = bucket["Name"]
        try:
            status = s3_client.get_bucket_policy_status(Bucket=name)
            if status["PolicyStatus"]["IsPublic"]:
                public_buckets.append(name)
        except s3_client.exceptions.ClientError as exc:
            # NoSuchBucketPolicy just means "no policy" — not public via policy.
            # Any other error (e.g. throttling) should be surfaced, not swallowed.
            if exc.response["Error"]["Code"] != "NoSuchBucketPolicy":
                raise
    return public_buckets

if __name__ == "__main__":
    client = boto3.client("s3")
    for name in find_public_buckets(client):
        print(f"PUBLIC BUCKET: {name}")
~~~

Complexity: O(n) in bucket count, one or two API calls per bucket. Follow-ups: also check public ACLs (get_bucket_acl) and account-level Block Public Access settings; auto-remediate by calling put_public_access_block instead of only reporting.

### 2. Exponential backoff with jitter for a throttled AWS API call

~~~python
import random
import time
import boto3
from botocore.exceptions import ClientError

RETRYABLE_ERRORS = {"ThrottlingException", "ProvisionedThroughputExceededException", "RequestLimitExceeded"}

def call_with_backoff(fn, *args, max_attempts: int = 5, base_delay: float = 0.5, **kwargs):
    """Call fn(*args, **kwargs), retrying retryable AWS errors with full jitter backoff."""
    for attempt in range(1, max_attempts + 1):
        try:
            return fn(*args, **kwargs)
        except ClientError as exc:
            code = exc.response["Error"]["Code"]
            if code not in RETRYABLE_ERRORS or attempt == max_attempts:
                raise  # not retryable, or we've exhausted attempts — surface the real error
            sleep_for = random.uniform(0, base_delay * (2 ** (attempt - 1)))
            time.sleep(sleep_for)
    raise RuntimeError("unreachable")  # loop always returns or raises

# Example usage:
dynamodb = boto3.client("dynamodb")
response = call_with_backoff(dynamodb.get_item, TableName="orders", Key={"id": {"S": "123"}})
~~~

Complexity: O(max_attempts) calls in the worst case. Discussion points: "full jitter" (random between 0 and the capped exponential value) avoids the thundering-herd problem of synchronized retries better than fixed or simple exponential backoff; boto3's own SDK-level retry config can do this automatically (retries mode "adaptive"), so production code often configures that instead of hand-rolling it.

### 3. Minimal least-privilege Terraform for a VPC-networked service (see the Terraform skill for depth)

~~~text
# resource "aws_security_group" "app" allows inbound only from the ALB's security group
# resource "aws_security_group" "db" allows inbound only from the app's security group
# resource "aws_db_instance" "main" sets multi_az = true and publicly_accessible = false
# resource "aws_lb" "public" sits only in the public subnets
#
# The reviewable property: tracing the security group references forms a strict
# chain — internet -> ALB SG -> app SG -> db SG -> nothing further -- with no
# rule anywhere granting 0.0.0.0/0 access to the app or database tier directly.
~~~

Discussion points: this is precisely the network topology traced in the Data Flow section's sequence diagram — the coding exercise is turning that diagram into IaC where every security group only references another security group, never a raw CIDR, for internal tiers.
`,

  "hands-on-labs": `
### Lab 1 — Static site on S3 and CloudFront (beginner, ~1h)
Host a static website in a private S3 bucket, served only through CloudFront (Origin Access Control, not a public bucket), with HTTPS via ACM. Deliverable: a public URL, and a written explanation of why the bucket itself stays private. Skills: S3, CloudFront, IAM resource policies, ACM.

### Lab 2 — VPC from scratch with a bastion-free EC2 instance (intermediate, ~2h)
Build a VPC by hand (CLI or console, then redo it in Terraform for comparison): 2 public + 2 private subnets across 2 AZs, an Internet Gateway, a NAT Gateway, and one EC2 instance in a private subnet reachable only via AWS Systems Manager Session Manager (no SSH, no bastion, no open port 22). Deliverable: a network diagram plus a Session Manager connection transcript. Skills: VPC, subnets, route tables, security groups, Session Manager.

### Lab 3 — Three-tier app: ALB, ECS Fargate, RDS Multi-AZ (advanced, ~4h)
Deploy a small FastAPI service as an ECS Fargate task behind an ALB, backed by an RDS Postgres instance in Multi-AZ mode, all in private subnets except the ALB. IAM task role scoped to only the specific Secrets Manager secret and CloudWatch Logs group it needs. Deliverable: a working API endpoint, and a paragraph tracing exactly which security group rule permits each hop (mirrors the Data Flow section). Skills: the entire Intermediate Concepts networking and compute sections, applied end to end.

### Lab 4 — Instrument, budget, and chaos-test it (production, ~3h)
Take Lab 3's stack and add: CloudWatch alarms on 5xx rate and p99 latency wired to an SNS topic, a Budget with an alert threshold, tagging on every resource, and one AWS Fault Injection Simulator experiment that terminates a task and confirms ECS replaces it and the ALB routes around the gap with no failed requests. Deliverable: a short incident-response runbook plus a chaos-test result screenshot/log. Skills: Monitoring, Production Checklist, and Testing sections, applied together.
`,

  "real-projects": `
Portfolio-grade projects, each mapping to skills employers screen for in a cloud/platform-adjacent AI engineering role:

1. **Multi-AZ FastAPI + Postgres + Redis reference stack** — Provision, via Terraform, the exact architecture in this page's Architecture Diagram: ECS Fargate service behind an ALB, Aurora Postgres Multi-AZ, ElastiCache Redis, all in a custom VPC with least-privilege security groups and IAM roles. Demonstrates: IaC discipline, network security design, and the managed-service mapping every AI-product team eventually needs.

2. **Serverless data pipeline** — An S3-triggered Lambda that validates and transforms uploaded files, writes results to DynamoDB, and publishes a completion event via EventBridge to a second Lambda that notifies a downstream system; dead-letter queues and CloudWatch alarms for failures. Demonstrates: event-driven serverless architecture, DynamoDB key design, and production-grade error handling in Lambda.

3. **Cost and security posture auditor** — A scheduled Lambda (or a small CLI tool) using boto3 that scans an account for the recurring pitfalls covered in this page: public S3 buckets, security groups open to 0.0.0.0/0 on sensitive ports, untagged resources, single-AZ production databases, and IAM policies granting Action: * — producing a prioritized report (or auto-remediating the safest findings). Demonstrates: real operational judgment about the exact risks this page teaches, expressed as working automation.

Each project should include: infrastructure fully defined in Terraform (see that skill), a README with an architecture diagram, tagged resources, and — critically — a section explaining the cost and security tradeoffs made, not just that it "works." That reasoning is what separates a portfolio piece from a tutorial clone in a senior interview.
`,

  "case-studies": `
### Netflix: chaos engineering as a first-class practice
Netflix built Chaos Monkey (and the broader Simian Army) specifically because a multi-AZ, multi-region AWS architecture is only as reliable as its untested failure paths. Randomly terminating production instances during business hours forced every team to build genuinely stateless, self-healing services rather than architectures that merely looked resilient on a diagram. Lesson: an architecture's resilience claims are unverified until something actually breaks it on purpose, in production, regularly.

### Capital One: the 2019 SSRF and IAM lesson
An attacker exploited a misconfigured web application firewall in front of a Capital One application to perform a server-side request forgery (SSRF) attack, tricking the application into querying the EC2 instance metadata service and retrieving that instance's IAM role credentials. Those credentials turned out to have far broader S3 permissions than the workload actually required, allowing access to roughly 100 million customer records. Lesson: this single breach is the reason IMDSv2 (which requires a session token, closing the simplest SSRF path) exists and is now an industry-standard hardening step, and it is the canonical real-world argument for least-privilege IAM roles — the breach's blast radius was a direct function of how over-permissioned that one role was.

### Dropbox: repatriating storage from AWS
After years of running substantial storage infrastructure on S3, Dropbox built its own custom storage system ("Magic Pocket") and migrated a large share of user data off AWS, citing better economics at their specific, enormous, and highly predictable scale. Lesson: cloud elasticity is most valuable when demand is variable or growing unpredictably; at sufficiently large, stable, well-understood scale, the calculus can flip toward owning infrastructure — a genuinely senior cost/build-vs-buy decision, not a rejection of cloud computing in general.

### NASA/JPL: bursty, public-facing demand
Processing and serving Mars rover imagery to a global public audience creates enormous, spiky, hard-to-predict demand around mission events — exactly the shape of workload that would be wasteful to provision for on owned hardware sized for the average case. Lesson: elasticity's value is proportional to how unpredictable and bursty a workload's demand actually is; steady, flat workloads benefit far less from on-demand elasticity and more from committed-use discounts.
`,

  comparisons: `
| Dimension | AWS | Azure | GCP | On-prem / bare metal |
|---|---|---|---|---|
| Market position | Largest by market share and service breadth | Strong in enterprise/Microsoft-shop accounts | Strong in data/ML and Kubernetes-native tooling | No shared infrastructure at all |
| Compute breadth | EC2, Lambda, ECS/EKS, Fargate — broadest options | VMs, Functions, AKS — comparable breadth | Compute Engine, Cloud Run, GKE — GKE is often considered the most mature managed Kubernetes | Full control, but you own everything: procurement, racking, patching |
| Managed database depth | RDS/Aurora, DynamoDB — very mature, widest engine selection | Azure SQL, Cosmos DB — deep integration with Microsoft stack | Cloud SQL, Spanner, Bigtable — Spanner's globally consistent SQL is a genuine differentiator | You run and patch everything yourself |
| IAM model | IAM: roles, policies, SCPs — powerful but famously intricate | Azure AD/Entra ID integration — strong if already a Microsoft shop | Cloud IAM — often considered the most straightforward of the three | Whatever you build (LDAP, custom) |
| Enterprise/Microsoft integration | Good, but not native | Best — deep Active Directory, Office 365, .NET integration | Good, improving | N/A |
| Data/ML tooling | Broadest breadth (SageMaker, Bedrock) but sometimes less polished UX | Growing fast, strong OpenAI partnership | Historically strongest ML/data tooling (BigQuery, Vertex AI) | You build and operate it all |
| Pricing model | Pay-as-you-go, Reserved Instances, Savings Plans, Spot | Similar model, Reservations, Spot | Similar model, Committed Use Discounts, sustained-use discounts automatic | Capex-heavy, but no ongoing rental cost at scale |

**How seniors choose**: default to AWS for the widest managed-service selection and the deepest hiring pool of engineers who already know it; choose Azure when the organization is already deeply invested in Microsoft's enterprise stack (Active Directory, .NET, Office 365); choose GCP when data/analytics and Kubernetes-native workloads dominate and the team values GCP's historically stronger tooling there; consider on-prem/bare metal only at scale large and predictable enough that the Dropbox-style repatriation math actually works out — and even then, usually as a hybrid alongside cloud, not a full replacement. See the **Azure** and **GCP** skills for the equivalent deep dives on those platforms.
`,

  "related-technologies": `
- **Terraform** — the dominant infrastructure-as-code tool for provisioning AWS resources in a reviewable, version-controlled, multi-cloud-portable way; the natural next page after this one if your focus is "provision AWS reliably."
- **Docker** — the container format that ECS, EKS, and Fargate all run; understanding image layers, the Dockerfile, and the container runtime is a prerequisite for reasoning about container workloads on AWS.
- **Kubernetes** — the orchestration system EKS manages the control plane for; if your team is Kubernetes-native, EKS is where that expertise lands on AWS.
- **CI/CD, GitHub Actions, Jenkins** — the pipeline layer that turns code changes into deployed ECS services, Lambda functions, or EC2 fleets, gated by tests and approvals.
- **Git** — version control for both application code and the Terraform/CloudFormation definitions of the infrastructure itself.
- **Azure, GCP** — the two other hyperscale clouds; most senior cloud engineers develop working fluency in the AWS-equivalent services on at least one alternative platform, both for multi-cloud roles and for a sharper sense of what's genuinely AWS-specific versus what's a general cloud pattern.
- **FastAPI, PostgreSQL, Redis** — the application-layer stack this page repeatedly maps onto AWS services (ECS Fargate, RDS/Aurora, ElastiCache respectively) — see Architecture Diagram for the concrete pairing.

On this platform, a natural learning path from here: **AWS** → **Terraform** (provision it in code) → **Docker** → **Kubernetes** (run containers at scale) → **CI/CD** (automate the deployment pipeline).
`,

  "latest-updates": `
Verified against my knowledge through my training cutoff (early-to-mid 2026) — check the official AWS "What's New" page and re:Invent keynote recordings for anything more recent.

- **Amazon Bedrock** (launched 2023) has continued expanding its roster of available foundation models (Anthropic's Claude family, Meta's Llama family, Amazon's own Titan/Nova models, and others) accessed through a single managed API — the primary way AWS positions itself in the generative-AI infrastructure race, separate from and complementary to SageMaker's traditional ML-training focus.
- **Custom silicon investment continues**: Graviton (ARM-based general-purpose CPUs, now in its third/fourth generation) for general compute price-performance, and Trainium/Inferentia for ML training and inference specifically, both positioned as lower-cost alternatives to GPU-based instances for workloads that fit their profile.
- **IMDSv2 enforcement** has moved from optional hardening to a default/strongly-recommended posture on new instances, directly informed by SSRF-based credential-theft incidents across the industry (see Case Studies).
- **Serverless and container tooling keeps converging**: Fargate's usability improvements and cost model refinements continue to narrow the gap with self-managed EC2-based clusters for many workloads.
- Treat every specific version number, price, or exact service capability in this section as something to re-verify — AWS ships changes continuously (frequently daily, at high volume around the annual re:Invent conference), and this page cannot stay current on its own.
`,

  "future-roadmap": `
Where AWS's investment appears to be heading, and what's worth betting career time on:

1. **Generative AI as a managed-infrastructure layer, not just a model API.** Bedrock's trajectory — more model choice, more fine-tuning/customization options, tighter integration with the rest of the AWS data and security stack — suggests AWS's strategy is to be the place teams *operate* generative AI in production (governance, cost control, data residency), not just where they call a model.
2. **Custom silicon (Graviton, Trainium, Inferentia) keeps expanding its share of both general compute and AI-specific workloads**, as AWS uses vertical hardware integration for a price-performance edge that's hard for pure software optimization to match.
3. **Serverless keeps eating more of the "I don't want to manage a server" market** — Fargate, Lambda, and their equivalents continue absorbing workloads that would have defaulted to raw EC2 a few years ago.
4. **Security posture management becomes more automated and less optional** — expect continued tightening of secure defaults (as IMDSv2 and S3 Block Public Access did) rather than relying on documentation telling customers to configure things safely themselves.
5. **Sustainability reporting and efficiency-linked cost optimization converge** — the newest Well-Architected pillar is increasingly presented alongside cost, since maximizing utilization per instance is simultaneously a cost lever and a sustainability lever.

For your career: deep fluency in IAM, VPC networking, and the tradeoffs between serverless/container/VM compute remains the durable core — service names and specific offerings churn constantly, but the underlying architectural reasoning this page teaches transfers to whatever AWS calls its newest service next year.
`,

  "cheat-sheet": `
~~~text
# --- Identity & access ---
aws sts get-caller-identity                 # "who am I?"
IAM: users (long-lived) / roles (temporary, assumed)
     / groups (bundle policies) / policies (JSON: Allow/Deny + Action + Resource)
Evaluation: default deny -> explicit Deny always wins -> explicit Allow grants
SCPs (org-level) and permission boundaries CAP what a policy can ever grant

# --- Compute ---
EC2        : VMs, full control, AMI + instance type + key pair
Lambda     : event-driven, no servers, pay per invocation, watch cold starts
ECS        : AWS-native container orchestration
EKS        : managed Kubernetes control plane (see Kubernetes skill)
Fargate    : serverless mode for ECS or EKS tasks/pods — no EC2 to patch

# --- Storage ---
S3   : object storage, buckets + keys, 11 nines durability, not a filesystem
EBS  : block storage attached to one EC2 instance (like a virtual disk)
EFS  : shared file storage, mountable by many instances at once

# --- Databases ---
RDS     : managed relational DB (Postgres/MySQL/etc), Multi-AZ = sync standby
Aurora  : AWS's cloud-native relational engine, faster failover, 6-way replication
DynamoDB: managed key-value/NoSQL, partition key drives scaling, watch hot partitions

# --- Networking ---
VPC 10.0.0.0/16 -> subnets (public/private) -> route tables
Public subnet   : route 0.0.0.0/0 -> Internet Gateway
Private subnet  : route 0.0.0.0/0 -> NAT Gateway (in a public subnet)
Security group  : stateful, allow-only, attached to instance/ENI
NACL            : stateless, allow+deny, attached to subnet
ALB : layer 7 (HTTP/HTTPS), path/host routing, TLS termination
NLB : layer 4 (TCP/UDP), ultra-low latency, preserves source IP
VPC Endpoint    : private route to AWS services, skip NAT/internet

# --- CLI quick reference ---
aws configure
aws ec2 run-instances --image-id ami-x --instance-type t3.micro
aws s3 cp file.txt s3://bucket/key.txt
aws logs tail /ecs/my-service --follow
aws cloudwatch put-metric-alarm --alarm-name x --threshold 10 ...

# --- Cost ---
On-demand      : pay per second/hour, no commitment
Reserved / Savings Plans : 1-3yr commitment, up to ~70% off, steady workloads
Spot           : spare capacity, up to ~90% off, can be reclaimed — stateless/batch only

# --- Observability ---
CloudWatch    : metrics, logs, alarms, dashboards
X-Ray         : distributed tracing across services
CloudTrail    : audit log of every API call, who did what and when
GuardDuty     : ML-based threat detection
Config        : continuous compliance/drift detection

# --- Production defaults ---
Multi-AZ everything stateful. Tag everything. Least-privilege IAM.
IaC (Terraform/CloudFormation), never console clicks in prod.
Secrets Manager/Parameter Store, never plaintext env vars with secrets baked in.
Budgets + Cost Anomaly Detection before you provision, not after the bill.
~~~
`,

  "flash-cards": `
| Front | Back |
|-------|------|
| What does the shared responsibility model split? | AWS secures "of" the cloud (hardware, hypervisor, managed-service internals); customer secures "in" the cloud (IAM, data, config) |
| Security group vs NACL | Stateful/allow-only/instance-scoped vs stateless/allow+deny/subnet-scoped |
| What does Multi-AZ RDS actually replicate? | A synchronous standby in a second AZ, with automatic failover on primary failure |
| ALB vs NLB | Layer 7 HTTP routing/TLS termination vs Layer 4 raw TCP/UDP, ultra-low latency |
| IAM policy evaluation order | Default deny -> explicit Deny always wins -> explicit Allow grants access |
| What is a VPC endpoint for? | Private connectivity to an AWS service without traversing the public internet or a NAT Gateway |
| Fargate's core tradeoff | No EC2 servers to patch/manage, at some cost/control tradeoff vs running ECS/EKS on EC2 |
| DynamoDB hot partition cause | Low-cardinality or skewed partition key concentrating traffic on one physical partition |
| S3 durability figure | 99.999999999% (11 nines) annual durability via multi-AZ erasure-coded replication |
| Reserved Instances vs Spot | Committed discount for steady workloads vs deep discount on interruptible spare capacity |
| IMDSv2's purpose | Session-token-based access to instance metadata, closing the SSRF-to-credential-theft path (see Capital One case study) |
| Well-Architected Framework pillars | Operational Excellence, Security, Reliability, Performance Efficiency, Cost Optimization, Sustainability |
| Control plane vs data plane | Managing/changing a resource vs actually using a running resource — different failure characteristics |
| Where should application secrets live? | Secrets Manager or Parameter Store, fetched at runtime via IAM role — never hardcoded or in plain env vars |
| Instance profile / execution role purpose | Grants temporary, auto-rotated AWS credentials to compute (EC2/Lambda) with no keys to manage |
`,

  mcqs: `
**1. A security group rule allows inbound TCP 8000 only from another security group (not a CIDR). What does this achieve?**

A) Nothing — security groups can't reference other security groups
B) Only resources with an ENI attached to the referenced security group can reach port 8000
C) It allows all traffic from the entire VPC
D) It blocks all traffic until a NACL is also configured

**Answer: B** — security-group-to-security-group references are the standard way to implement tiered least-privilege access (e.g., app tier only reachable from the ALB's security group).

**2. An IAM identity has an Allow on "s3:*" for a bucket, but an SCP at the organization level has a Deny on "s3:DeleteObject" for that account. Can the identity delete an object in that bucket?**

A) Yes, the identity policy's Allow wins
B) No — an explicit Deny anywhere in the evaluation always wins
C) It depends on which was created first
D) Only the root user can override an SCP

**Answer: B** — SCPs are guardrails; an explicit Deny at any level (SCP, resource policy, identity policy, permissions boundary) always overrides any Allow.

**3. Which is the most likely root cause of "database unreachable" when the database's security group correctly allows the app tier, but the app is in a different VPC than the database?**

A) The security group rule syntax is wrong
B) There's no network path between the two VPCs (no peering/Transit Gateway) even though the security group rule is valid
C) NACLs always block cross-VPC traffic
D) RDS never supports cross-VPC access

A security group correctly allowing another security group only works within reachable network paths.

**Answer: B** — a valid security group rule doesn't create connectivity between VPCs; that requires VPC Peering, Transit Gateway, or PrivateLink first.

**4. Why does DynamoDB throttle one specific key even though the table's overall provisioned capacity looks healthy?**

A) DynamoDB has a global bug affecting single keys
B) Throughput is allocated per partition, and a hot key concentrates traffic on one partition regardless of table-wide capacity
C) The table needs a GSI to fix this automatically
D) This only happens with eventually consistent reads

**Answer: B** — partition-level throughput allocation is the mechanism; the fix is better key design or write-sharding, not simply raising the table's overall provisioned capacity.

**5. What is the primary purpose of a NAT Gateway?**

A) Let private-subnet resources initiate outbound internet connections without being directly reachable from the internet
B) Let internet traffic reach private-subnet resources directly
C) Replace the need for security groups
D) Provide DNS resolution for the VPC

**Answer: A** — NAT Gateways enable one-way outbound connectivity for private subnets; inbound connections from the internet still cannot reach those resources directly.

**6. A Lambda function's cold start is dominated by the Init phase. Which fix directly addresses this for a latency-sensitive, user-facing path?**

A) Increasing the function's timeout setting
B) Provisioned Concurrency, which keeps execution environments pre-initialized and warm
C) Switching the trigger from API Gateway to S3
D) Increasing the function's memory allocation only

**Answer: B** — Provisioned Concurrency directly targets Init-phase latency by keeping environments warm; memory increases can help CPU-bound Invoke-phase work but don't eliminate cold Init time the way Provisioned Concurrency does.
`,

  "revision-notes": `
**Core model in 5 lines:** AWS rents undifferentiated infrastructure (compute, storage, database, networking) by the hour/second/request instead of you buying and operating it. Regions contain multiple Availability Zones for fault isolation; most services are regional, IAM/Route53/CloudFront are global. Everything is an API call — the console is just one client of the same APIs the CLI/SDKs/Terraform use. The shared responsibility model draws the line: AWS secures the cloud's infrastructure, you secure your configuration and data inside it. Twenty or so services (EC2, Lambda, ECS/EKS/Fargate, S3, EBS, RDS/Aurora, DynamoDB, VPC + its networking primitives, IAM, CloudWatch) cover the large majority of real production architectures.

**Compute choice in 4 lines:** EC2 for full control and specialized hardware. Lambda for event-driven, bursty, no-server-management workloads — watch cold starts. ECS/EKS for steady-state containerized services, with Fargate removing EC2 patching from either. Choose based on operational overhead tolerance, latency sensitivity, and how steady versus bursty the load actually is.

**Networking and security in 5 lines:** A VPC splits into public subnets (route to an Internet Gateway) and private subnets (route to a NAT Gateway for outbound-only access). Security groups (stateful, allow-only, instance-scoped) do most of the real access-control work; NACLs (stateless, subnet-scoped) are a coarser secondary layer. IAM policy evaluation is default-deny, with any explicit Deny anywhere always winning over any Allow. Least-privilege IAM roles for compute (never embedded long-lived keys) and Multi-AZ for every stateful resource are the two highest-leverage production defaults.

**Production operations in 5 lines:** Provision through IaC (Terraform/CloudFormation) via CI/CD, never console clicks, in a multi-account Organization structure that isolates blast radius by environment. Tag every resource; set Budgets and Cost Anomaly Detection before provisioning. Instrument with CloudWatch metrics/logs/alarms and X-Ray tracing; escalate debugging through Logs Insights -> X-Ray -> VPC Flow Logs/Reachability Analyzer -> CloudTrail. Enable GuardDuty, Security Hub, and Config account-wide from day one, not after an incident.

**Cost and the mental model in 4 lines:** On-demand for unpredictable/new workloads; Reserved Instances or Savings Plans for steady, known baseline usage; Spot for interruptible, fault-tolerant batch or stateless work at up to ~90% off. AWS's elasticity is most valuable for variable or growing demand (Netflix, NASA/JPL-style bursty workloads) and least valuable at very large, stable, predictable scale (Dropbox's storage repatriation is the counter-lesson). The Well-Architected Framework's six pillars — Operational Excellence, Security, Reliability, Performance Efficiency, Cost Optimization, Sustainability — are the structured lens senior engineers use to review any architecture against these tradeoffs.
`,

  "learning-roadmap": `
A realistic path to production-ready AWS fluency (adjust pace to your background):

**Week 1–2 — Foundations.** Beginner Concepts + Lab 1 (S3 + CloudFront static site). Get comfortable with the CLI, IAM basics, and the console-equals-API mental model. Milestone: launch, use, and tear down an EC2 instance and an S3 bucket without hesitation.

**Week 3–4 — Networking.** Intermediate Concepts' VPC/subnets/security-groups/load-balancer material + Lab 2 (VPC from scratch, Session-Manager-only access). Milestone: draw your own VPC diagram from memory and explain every route table entry.

**Week 5–6 — Compute and data tradeoffs.** The rest of Intermediate Concepts (Lambda, ECS/EKS/Fargate, RDS/Aurora, DynamoDB) plus the Comparisons section. Milestone: given a workload description, justify a compute and database choice out loud, unprompted.

**Week 7–8 — Production architecture.** Internal Working, Architecture, Data Flow, and Advanced Concepts (Well-Architected, IAM policy evaluation, multi-account). Lab 3 (three-tier ALB/ECS/RDS app). Milestone: trace a request through your own architecture, security-group hop by security-group hop.

**Week 9–10 — Operations.** Monitoring, Deployment, Security, Production Checklist sections. Lab 4 (instrument, budget, chaos-test). Milestone: a documented runbook and a passed chaos-engineering test on your own stack.

**Week 11–12 — Interview polish and a portfolio project.** Interview/Coding Questions sections; build Real Project 1 (the multi-AZ FastAPI/Postgres/Redis reference stack) fully in Terraform. Milestone: explain the shared responsibility model, IAM policy evaluation, and your compute choice rationale clearly and unprompted.

Then continue to **Terraform** on this platform to provision everything here as reviewable, version-controlled code, followed by **Docker** and **Kubernetes** to go deep on the container runtime and orchestration layer underneath ECS/EKS.
`,

  "official-docs": `
- [AWS Documentation home](https://docs.aws.amazon.com/) — the full reference index across every service.
- [AWS Well-Architected Framework](https://aws.amazon.com/architecture/well-architected/) — the six-pillar whitepaper and per-pillar deep-dive lenses.
- [IAM User Guide](https://docs.aws.amazon.com/IAM/latest/UserGuide/) — the policy evaluation logic, roles vs users, and permission boundaries explained precisely.
- [Amazon VPC User Guide](https://docs.aws.amazon.com/vpc/latest/userguide/) — subnets, route tables, security groups, NACLs, endpoints, peering, Transit Gateway.
- [AWS Pricing Calculator](https://calculator.aws/) — model real costs for a proposed architecture before building it.
- [AWS What's New](https://aws.amazon.com/new/) — the authoritative source for anything released after this page's knowledge cutoff.
- [AWS Skill Builder / AWS Training and Certification](https://aws.amazon.com/training/) — official learning paths and certification exam guides.
`,

  books: `
- **AWS Certified Solutions Architect Study Guide** (Sybex, various editions) — a structured, exam-anchored tour of the core services; useful even if you never sit the exam, for its breadth.
- **Cloud Native Patterns** — Cornelia Davis. Architectural patterns (not AWS-specific syntax) for building software that actually behaves well on elastic infrastructure — the mindset shift this page keeps emphasizing.
- **Terraform: Up and Running** — Yevgeniy Brikman. The standard reference for provisioning AWS (and other clouds) as code; pairs directly with the **Terraform** skill.
- **Kubernetes: Up and Running** — Hightower, Burns, Beda. Essential once EKS is in scope; explains the orchestration layer AWS manages the control plane for.
- **The Amazon Way** — John Rossman. Not a technical book, but useful for understanding the internal culture (the API mandate, "working backwards") that produced AWS's own service-oriented DNA.
- **Site Reliability Engineering** (Google, free online) — not AWS-specific, but the operational discipline (SLOs, error budgets, incident response) this page's Monitoring and Production Checklist sections assume.
`,

  blogs: `
- **AWS News Blog** (aws.amazon.com/blogs/aws) — official, first-party announcements; the most reliable source for "did this actually ship."
- **AWS Architecture Blog** — reference architectures and pattern write-ups directly from AWS solutions architects.
- **Corey Quinn / Last Week in AWS** (lastweekinaws.com) — sharp, opinionated, cost-focused commentary; excellent for developing pricing and vendor-strategy intuition.
- **Netflix Technology Blog** — recurring deep dives into how one of AWS's largest customers actually operates at scale (chaos engineering, resilience patterns).
- **The New Stack** (thenewstack.io) — cloud-native and Kubernetes-adjacent coverage, useful context for the ECS/EKS decision space.
- **Individual re:Invent session write-ups** — searching a specific service name plus "re:Invent" surfaces the deepest, most current explanations directly from AWS's own engineers.
`,

  "research-papers": `
AWS itself is engineering, not academia, but several foundational papers directly underpin services covered on this page — reading them is unusually high-leverage for understanding *why* a service behaves the way it does:

- **"Dynamo: Amazon's Highly Available Key-value Store"** (DeCandia et al., SOSP 2007) — the direct intellectual ancestor of DynamoDB: consistent hashing, quorum reads/writes, vector clocks for conflict resolution. Read this before trying to reason deeply about DynamoDB's consistency model.
- **"Amazon Aurora: Design Considerations for High Throughput Cloud-Native Relational Databases"** (Verbitski et al., SIGMOD 2017) — explains the log-structured, storage/compute-decoupled architecture behind Aurora's fast failover and six-way cross-AZ replication.
- **"Firecracker: Lightweight Virtualization for Serverless Applications"** (Agache et al., NSDI 2020) — the microVM technology underlying Lambda and Fargate's ability to isolate many customers' functions/containers on shared hardware with strong security boundaries and fast startup.

If this list feels thin relative to a research-heavy skill page, that's honest: AWS is fundamentally an applied-engineering platform. The closest adjacent foundational reading beyond these three is general distributed-systems literature (CAP theorem discussions, Paxos/Raft consensus papers) that underlies the guarantees every managed AWS data service ultimately makes.
`,

  videos: `
- **AWS re:Invent keynotes** (search by year) — the annual state-of-the-platform address; watching the last 2-3 years builds a strong sense of where AWS is actually investing.
- **"A Cloud Guru" and equivalent structured course platforms' AWS Solutions Architect series** — accessible, exam-anchored walkthroughs of the core services covered in this page's Beginner/Intermediate sections.
- **Werner Vogels' re:Invent keynote talks** — AWS's CTO on the architectural philosophy behind the platform, useful for the "why does AWS make these design choices" question this page asks throughout.
- **Individual service deep-dive sessions from re:Invent** (e.g., "Deep dive on Amazon VPC," "Deep dive on IAM") — consistently the most technically detailed public explanations of exactly how a service works internally.
- **Corey Quinn's conference talks on AWS billing/cost** — the clearest public explanations of how AWS pricing actually behaves in practice, beyond the list-price documentation.
`,

  "github-repos": `
- [aws/aws-cli](https://github.com/aws/aws-cli) — the official CLI source; useful for understanding exactly what any command does under the hood.
- [boto/boto3](https://github.com/boto/boto3) — the official Python SDK used throughout this page's code examples.
- [hashicorp/terraform-provider-aws](https://github.com/hashicorp/terraform-provider-aws) — the AWS provider for Terraform; browsing its resource docs is often faster than the AWS console for understanding a resource's full configuration surface.
- [localstack/localstack](https://github.com/localstack/localstack) — runs a local emulation of many AWS services for fast, offline development and testing.
- [getmoto/moto](https://github.com/getmoto/moto) — the mocking library used in this page's Testing section for fast unit tests against boto3 code.
- [aws/amazon-ecs-agent](https://github.com/aws/amazon-ecs-agent) — the open-source agent running on every ECS container instance; instructive for understanding ECS's actual mechanics.
- [awslabs/aws-well-architected-labs](https://github.com/awslabs/aws-well-architected-labs) — hands-on labs directly mapped to the Well-Architected Framework's pillars.
- [aws-samples](https://github.com/aws-samples) (organization, many repos) — official reference architectures and sample applications across nearly every service.
- [awsdocs](https://github.com/awsdocs) (organization) — the source of AWS's own documentation, useful for tracking exact wording changes over time.
`,

  "practice-problems": `
**Ordered by skill focus:**

1. *IAM fluency*: write a policy granting a role read-only access to exactly one S3 prefix and nothing else; verify it with the IAM Policy Simulator; then intentionally add a conflicting Deny and predict the outcome before testing it.
2. *Networking*: design (on paper, then in Terraform) a VPC with 2 public and 2 private subnets across 2 AZs, then trace by hand which security group and route table entries permit a request from the internet to reach a database in a private subnet — and confirm nothing else can.
3. *Compute choice*: given three workload descriptions (a webhook receiver firing a few times an hour, a steady-state API serving constant traffic, and a nightly batch job processing a large dataset), justify a specific compute choice (Lambda/ECS-Fargate/EC2+Spot) for each with cost and operational reasoning.
4. *DynamoDB design*: design a partition key and (if needed) a GSI for a workload with a genuinely skewed access pattern (e.g., one "global" record read far more than any per-user record); explain how your design avoids a hot partition.
5. *Cost optimization*: given a fleet's CloudWatch CPU utilization history, decide which instances should move to Reserved Instances/Savings Plans, which should move to Spot, and which should simply be right-sized down — with numbers, not just intuition.
6. *Debugging*: given a scenario where an ECS service's ALB health checks are failing, walk the full escalation path (Logs Insights -> ECS task logs -> security group rules -> health check configuration) to the actual root cause.
7. *Resilience*: design a Multi-AZ failure test using AWS Fault Injection Simulator for your own Lab 3 stack, predict the expected behavior before running it, and compare.

External sets: AWS's own **Well-Architected Labs** (hands-on, pillar-by-pillar), **AWS Skill Builder** free digital courses, and the practice exams for **AWS Certified Solutions Architect – Associate**, which — even if you never sit the exam — cover almost exactly the breadth this page recommends mastering.
`,

  "architecture-diagram": `
The reference production architecture for this platform's own stack (FastAPI, Postgres, Redis) deployed on AWS — the shape you'll build repeatedly in the Hands-on Labs and Real Projects sections:

~~~mermaid
flowchart TB
    Client["Clients (web/mobile)"] --> R53["Route 53 (DNS)"]
    R53 --> CF["CloudFront (optional CDN + WAF)"]
    CF --> ALB["Application Load Balancer\n(public subnets, 2+ AZs)"]
    ALB --> API1["ECS Fargate task 1\n(FastAPI, private subnet AZ-a)"]
    ALB --> API2["ECS Fargate task N\n(FastAPI, private subnet AZ-b)"]
    API1 & API2 --> PG[("RDS/Aurora Postgres\nMulti-AZ, private subnets")]
    API1 & API2 --> RD[("ElastiCache Redis\ncache + rate limits + queues")]
    API1 & API2 -->|enqueue| SQS["SQS queue"]
    SQS --> W1["Worker task(s) on Fargate\nembeddings · emails · batch"]
    W1 --> PG
    API1 & API2 -->|IAM role, scoped| SEC["Secrets Manager\n(DB credentials, API keys)"]
    subgraph Observability
        CW["CloudWatch metrics/logs/alarms"]
        XR["X-Ray traces"]
        CT["CloudTrail audit log"]
        GD["GuardDuty / Security Hub"]
    end
    API1 -.-> Observability
    API2 -.-> Observability
    W1 -.-> Observability
~~~

Every box maps directly onto this platform's own application stack: FastAPI containers run as ECS Fargate tasks (no EC2 to patch), Postgres runs on Multi-AZ RDS or Aurora, and Redis runs on ElastiCache — the same managed-service reasoning taught throughout Intermediate and Advanced Concepts, applied to a concrete, familiar stack.
`,

  "mind-map": `
~~~mermaid
mindmap
  root((AWS))
    Compute
      EC2
      Lambda
      ECS
      EKS
      Fargate
    Storage
      S3
      EBS
      EFS
    Databases
      RDS
      Aurora
      DynamoDB
      ElastiCache
    Networking
      VPC and subnets
      Security groups and NACLs
      ALB and NLB
      Route 53 and CloudFront
      Transit Gateway and PrivateLink
    Security
      IAM users roles policies
      Shared responsibility model
      GuardDuty Security Hub Config
      KMS encryption
    Operations
      CloudWatch
      X-Ray
      CloudTrail
      Well-Architected Framework
    Cost
      On-demand
      Reserved Instances and Savings Plans
      Spot
      Budgets and Cost Explorer
    Career
      Interview classics
      Labs and portfolio projects
      Path to Terraform Docker Kubernetes
~~~
`,
};

export default aws;
