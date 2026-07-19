import type { SkillContent } from "../types";

/**
 * Kubernetes — full 50-section knowledge page.
 * Note: code blocks use ~~~ fences (CommonMark-equivalent to backtick fences)
 * so this file needs no backtick escaping inside the template literals.
 */
const kubernetes: SkillContent = {
  overview: `
Kubernetes (often shortened to K8s — a "numeronym" counting the eight letters between the K and the s) is an open-source container orchestration platform that automates deploying, scaling, healing, and networking containerized applications across a cluster of machines. Where the **Docker** skill on this platform covers packaging one application into one container and running it on one machine, Kubernetes answers the next question every team eventually hits: what happens when you have hundreds of containers across dozens of machines, and a human can no longer track which container is running where, whether it crashed, or whether the machine underneath it just died?

For an AI engineer, Kubernetes is the substrate almost every serious inference and training platform runs on. Model-serving containers (vLLM, Triton, TorchServe, a custom FastAPI wrapper around a model), GPU-backed training jobs, vector databases, feature stores, and the surrounding microservices of an AI product are typically deployed, scaled, and healed by Kubernetes — whether that is a self-managed cluster or a managed offering like Amazon EKS, Azure AKS, or Google GKE (see the **AWS**, **Azure**, and **GCP** skills for the managed-Kubernetes layer each cloud provides). Understanding Kubernetes is what lets you reason about why a model server got killed under memory pressure, why a rollout of a new model version caused a latency spike, or how to autoscale GPU inference pods against real traffic.

Key characteristics: Kubernetes is **declarative** — you describe the desired end state (three replicas of this container, listening on this port, with this much CPU) in YAML manifests, and Kubernetes continuously works to make reality match that description, rather than you issuing imperative "start this, stop that" commands. It is **self-healing** — a crashed container gets restarted, a dead node's workloads get rescheduled elsewhere, without a human paging anyone at 3 AM for the routine case. It is **extensible** — Custom Resource Definitions (CRDs) and the operator pattern let you teach the cluster entirely new object types and controllers, which is how Helm charts, service meshes, and ML-specific platforms (Kubeflow, KServe) build on top of core Kubernetes instead of replacing it. And it is **API-driven**: literally everything — kubectl, Helm, your CI/CD pipeline, a controller — talks to the same REST API served by the API server, which is the single front door into the cluster.
`,

  history: `
Kubernetes' direct ancestor is **Borg**, Google's internal cluster manager, which by the mid-2000s was already scheduling and managing the vast majority of Google's internal workloads (search, Gmail, and eventually Google Cloud itself) across hundreds of thousands of machines. A related internal project, **Omega**, experimented with a more flexible, shared-state scheduling architecture. Kubernetes was designed by Google engineers — including Joe Beda, Brendan Burns, and Craig McLuckie — as a from-scratch, open-source reimagining of Borg's ideas, deliberately shedding over a decade of Borg's internal cruft and making the API the center of the design from day one.

| Year | Milestone |
|------|-----------|
| 2003–2004 | Borg begins running production workloads inside Google, unpublished for a decade |
| 2013 | Omega paper published, describing Google's next-generation, shared-state scheduler research |
| 2014 (June) | Google open-sources Kubernetes v0.1 on GitHub |
| 2015 | Kubernetes 1.0 ships; Google simultaneously donates it to the newly formed **Cloud Native Computing Foundation (CNCF)** under the Linux Foundation |
| 2015 | The Borg, Omega, and Kubernetes retrospective paper is published, explicitly connecting the lineage |
| 2016 | Helm (the package manager) and the CRD mechanism (then ThirdPartyResources) emerge, kicking off the extensibility ecosystem |
| 2017 | Docker Inc. and AWS both add native Kubernetes support; it visibly wins the "container orchestration wars" against Docker Swarm and Apache Mesos |
| 2017 | Kubernetes 1.6 makes **RBAC** the default authorization mode (see the **RBAC** skill) |
| 2018 | Kubernetes becomes the first project to graduate CNCF status; the operator pattern and CRDs mature into the standard extensibility model |
| 2018 | All three major clouds (AWS EKS GA, Azure AKS GA, Google GKE already mature) offer managed Kubernetes |
| 2020 | Dockershim (Kubernetes' built-in Docker-Engine support) deprecation announced, formalizing the shift to the Container Runtime Interface (CRI) and runtimes like containerd/CRI-O |
| 2022 | Dockershim removed in Kubernetes 1.24 — pure CRI runtimes only from here on |
| 2023–2025 | Gateway API matures as the eventual successor to Ingress; in-place pod resource resizing and Dynamic Resource Allocation (for GPUs and other specialized hardware) advance from alpha toward stability, directly relevant to AI/ML workloads |

The throughline: Kubernetes won not because it was first, but because Google encoded over a decade of real production-scheduling lessons into a clean, declarative, API-first design, then gave it away and let a vendor-neutral foundation (CNCF) govern it — removing the single-vendor risk that made teams wary of Docker Swarm's Docker Inc. ownership or Mesos' Mesosphere ownership.
`,

  "why-it-exists": `
Before Kubernetes, the state of the art for running containers at scale was: write your own scripts, or use a simpler scheduler (Docker Swarm, Apache Mesos with Marathon, or hand-rolled Ansible/Chef playbooks that SSH into boxes and start containers). None of these fully solved the problem once you had real production scale, because none of them treated "the cluster's desired state" as the central abstraction.

The world before Kubernetes looked like this: an engineer (or a fragile script) decided which of 50 machines should run which of 500 containers, using CPU/memory numbers that were stale the moment they were computed. When a machine died at 2 AM, someone had to notice, figure out what was running on it, and manually reschedule those containers elsewhere — or write bespoke tooling to do that, which every company did slightly differently and none of them shared. Scaling up meant manually picking a target machine, starting a container there, and manually wiring it into a load balancer's config. Rolling out a new version meant a risky, usually manual, sequence of stop-old/start-new that either dropped traffic or required hand-built blue-green scripting.

Kubernetes' founders — having watched Borg solve exactly this problem inside Google for a decade — built a single, general-purpose answer: describe the desired state declaratively, let a control loop continuously reconcile actual state toward it (see Internal Working), and expose everything through one consistent API so tooling, humans, and other automation could all speak the same language. The gap Kubernetes filled was not "how do I run one container" (Docker already solved that) — it was "how do I run a fleet of containers, on a fleet of machines, so that failures are absorbed automatically and I only ever need to state what I want, not walk through how to get there."
`,

  "problem-it-solves": `
Kubernetes concretely removes:

- **Manual scheduling.** You do not pick which machine runs which container. You state resource requirements (CPU, memory, and for AI workloads, GPUs); the scheduler bin-packs pods onto nodes with capacity, considering constraints like affinity and taints (see Advanced Concepts).
- **Manual failure recovery.** A crashed container is restarted by the kubelet on the same node. A dead node's pods are detected and rescheduled onto healthy nodes by the control plane, with zero human intervention for the routine case. This is what "self-healing" means concretely.
- **Manual scaling.** The Horizontal Pod Autoscaler adjusts replica count based on observed CPU/memory or custom metrics (queue depth, requests per second); the Cluster Autoscaler adds or removes nodes when pods can't be scheduled or nodes sit idle.
- **Manual service discovery and load balancing.** A Service gives a stable DNS name and virtual IP in front of a fluctuating set of pod IPs (pods are ephemeral — they get new IPs every time they're recreated); kube-proxy handles the load balancing across whichever pods currently match.
- **Risky, manual deployments.** Rolling updates replace pods gradually with health-check gating, and a bad rollout can be rolled back with a single command (see Best Practices and Deployment).
- **Configuration/secret sprawl.** ConfigMaps and Secrets decouple application code from environment-specific configuration and credentials, injected as environment variables or mounted files at runtime.

What Kubernetes deliberately does **not** solve:

- **It is not a build system or CI/CD pipeline.** It does not build your container image or run your tests — that's the **CI/CD**, **GitHub Actions**, and **Jenkins** skills' territory. Kubernetes only runs images that already exist in a registry.
- **It is not a full PaaS by itself.** Unlike Heroku, Kubernetes gives you the primitives (Pod, Service, Ingress) but expects you (or an add-on like Knative) to assemble them into a full developer experience.
- **It does not manage your data's durability by itself.** StatefulSet and PersistentVolume give stateful workloads stable identity and storage, but backup, replication topology, and disaster recovery for a real database are still the database's job (or a specialized operator's), not core Kubernetes'.
- **It does not eliminate the need for good application design.** A container that ignores SIGTERM, holds all its state in local memory with no external store, or can't tolerate being killed and restarted at any moment will behave badly on Kubernetes exactly as it would badly on any elastic infrastructure. Kubernetes rewards twelve-factor-style stateless, disposable processes; it does not retrofit good architecture onto an application that assumes a single, permanent machine.
- **It does not fully abstract away infrastructure provisioning.** Someone still has to provision the underlying nodes/VPC/storage — commonly with the **Terraform** skill's infrastructure-as-code approach, whether self-hosting or provisioning a managed cluster on AWS/Azure/GCP.
`,

  "learning-objectives": `
By the end of this page you should be able to:

1. Explain what problem Kubernetes solves that a single Docker host cannot, and describe the reconciliation/control-loop model that underpins every Kubernetes object.
2. Write and reason about the core object manifests: Pod, Deployment, ReplicaSet, Service (ClusterIP/NodePort/LoadBalancer), Ingress, ConfigMap, Secret, Namespace, StatefulSet, and DaemonSet.
3. Describe the control-plane architecture (API server, etcd, scheduler, controller manager) versus the worker-node architecture (kubelet, kube-proxy, container runtime), and what each component is responsible for.
4. Deploy a realistic multi-object application — a Deployment, Service, Ingress, ConfigMap, and Secret working together — for a service like this platform's own FastAPI backend.
5. Configure resource requests/limits, liveness/readiness/startup probes, and explain how the scheduler and kubelet use each.
6. Set up a Horizontal Pod Autoscaler and perform a rolling update with a safe rollback plan.
7. Use Helm to template and package an application for repeatable, parameterized deployment across environments.
8. Reason about multi-tenancy (namespaces, RBAC, network policies) and describe how GitOps tools (ArgoCD/Flux) change the deployment workflow.
9. Debug a broken pod using the standard escalation path: describe, logs, exec, events.
10. Answer senior-level interview questions on the reconciliation model, scheduling, and production failure modes.
`,

  prerequisites: `
- **Required — the Docker skill.** Kubernetes orchestrates containers; it does not create them. You must already understand images, layers, the container runtime, and how to build and run a single container before orchestrating fleets of them. If Docker concepts (image, layer, container, registry) are unfamiliar, stop and read the **Docker** skill first — this page assumes that vocabulary fluently and will not re-teach it.
- **Required**: comfort reading YAML (indentation-sensitive key-value structure) and basic command-line usage (see the **Linux** skill).
- **Helpful**: basic networking concepts — IP addresses, ports, DNS, load balancing (see the **Networking** skill) — since Services and Ingress are fundamentally networking abstractions.
- **Helpful**: familiarity with at least one cloud provider (**AWS**, **Azure**, or **GCP**) if you plan to run managed Kubernetes (EKS/AKS/GKE) rather than a local cluster.
- **For the security sections**: this page deliberately does NOT re-derive Kubernetes' Role/ClusterRole/RoleBinding model in depth — the **RBAC** skill already covers that as a worked example of the broader RBAC pattern. Read RBAC's Advanced Concepts section for the Kubernetes-specific manifests; this page focuses on how RBAC fits into the wider orchestration and multi-tenancy picture.
- **For provisioning the cluster itself**: the **Terraform** skill covers infrastructure-as-code, which is how real teams create the VPC, node pools, and managed control plane that Kubernetes then runs on top of.

Dependency links on this platform: **Docker** (package one container) → this page (orchestrate many) → **Helm/GitOps concepts** (package and ship at scale) → **Prometheus/Grafana** (observe it) → **Terraform** (provision it as code).
`,

  "beginner-concepts": `
### The Pod — the smallest deployable unit

Kubernetes never schedules a bare container — it schedules a **Pod**, a group of one or more containers that share a network namespace (same IP, same localhost) and storage volumes. Almost always a Pod holds exactly one application container, plus optionally small helper "sidecar" containers (a log shipper, a service-mesh proxy) that need to share that network/storage with it.

~~~yaml
# pod.yaml — the simplest possible Pod
apiVersion: v1
kind: Pod
metadata:
  name: hello-pod
  labels:
    app: hello
spec:
  containers:
    - name: hello
      image: nginxdemos/hello:latest
      ports:
        - containerPort: 80
~~~

~~~bash
kubectl apply -f pod.yaml        # create/update from a manifest — the declarative way
kubectl get pods                 # list pods
kubectl get pods -o wide         # include node, IP
kubectl delete pod hello-pod     # tear it down
~~~

Pods are **ephemeral and disposable by design** — you almost never create a bare Pod directly in production, because if it dies, nothing recreates it. That is exactly the gap a Deployment fills.

### The Deployment and ReplicaSet — self-healing, declared replica count

A **Deployment** describes a desired Pod template plus a replica count; it creates and owns a **ReplicaSet**, which is the object that actually watches over "there should be N pods matching this template right now" and creates or deletes pods to make that true.

~~~yaml
# deployment.yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: hello-deployment
spec:
  replicas: 3                     # desired state: 3 running pods
  selector:
    matchLabels:
      app: hello
  template:                       # the Pod template the ReplicaSet stamps out
    metadata:
      labels:
        app: hello
    spec:
      containers:
        - name: hello
          image: nginxdemos/hello:latest
          ports:
            - containerPort: 80
~~~

Kill one of the three pods by hand (kubectl delete pod some-hello-pod) and watch a fourth immediately appear — that single experiment is the clearest possible demonstration of self-healing, and every beginner should run it once.

### The Service — a stable address for a moving target

Pods get a new IP address every time they are recreated. A **Service** gives a stable virtual IP and DNS name in front of whichever pods currently match its label selector, and load-balances across them.

~~~yaml
# service.yaml — ClusterIP: reachable only inside the cluster (the default)
apiVersion: v1
kind: Service
metadata:
  name: hello-svc
spec:
  type: ClusterIP
  selector:
    app: hello            # routes to any pod with label app=hello
  ports:
    - port: 80             # the Service's own port
      targetPort: 80        # the container's port
~~~

Three Service types matter for beginners: **ClusterIP** (internal-only, the default — used for service-to-service traffic inside the cluster), **NodePort** (opens a fixed port on every node's own IP, mostly used for quick testing or bare-metal setups without a cloud load balancer), and **LoadBalancer** (asks the cloud provider — AWS/Azure/GCP — to provision an external load balancer pointed at the Service; the standard way to expose a service publicly on a managed cluster).

### Namespaces — logical partitioning of a cluster

A **Namespace** is a virtual partition of one physical cluster — a way to separate teams, environments (dev/staging/prod), or applications without running separate clusters for each.

~~~bash
kubectl create namespace payments
kubectl get pods -n payments             # scope any command to a namespace
kubectl config set-context --current --namespace=payments   # switch the default
~~~

### ConfigMap and Secret — configuration outside the image

A **ConfigMap** holds non-sensitive configuration; a **Secret** holds sensitive values (API keys, DB passwords), base64-encoded (not encrypted by default — see Security). Both can be injected as environment variables or mounted as files, so the same container image runs unchanged across dev, staging, and prod with only the config swapped.

~~~yaml
apiVersion: v1
kind: ConfigMap
metadata:
  name: app-config
data:
  LOG_LEVEL: "info"
  MAX_CONNECTIONS: "100"
---
apiVersion: v1
kind: Secret
metadata:
  name: app-secret
type: Opaque
stringData:               # stringData accepts plain text; Kubernetes base64-encodes it for you
  DATABASE_PASSWORD: "changeme-in-real-life"
~~~

### kubectl — the essential command vocabulary

~~~bash
kubectl get <kind>                 # list objects (pods, deployments, services, ...)
kubectl describe <kind> <name>     # detailed status + recent events — the first debugging step
kubectl logs <pod>                 # container stdout/stderr
kubectl exec -it <pod> -- sh       # a shell inside a running container
kubectl apply -f manifest.yaml     # create or update — the declarative workhorse
kubectl delete -f manifest.yaml    # remove what a manifest describes
~~~

Common beginner trap: editing a running object with kubectl edit and forgetting to also update the source-of-truth YAML file — the next kubectl apply from the old file silently reverts your change. Treat the YAML file, not the live cluster, as the source of truth (this becomes formalized as GitOps — see Production Usage).
`,

  "intermediate-concepts": `
### Ingress — HTTP(S) routing at the edge

A Service (even LoadBalancer) gives you one entrypoint per service. **Ingress** is a single Kubernetes object that routes HTTP(S) traffic to many different Services based on hostname and path, backed by an Ingress Controller (nginx-ingress, Traefik, or a cloud-native one) that actually implements the routing.

~~~yaml
apiVersion: networking.k8s.io/v1
kind: Ingress
metadata:
  name: hello-ingress
  annotations:
    nginx.ingress.kubernetes.io/rewrite-target: /
spec:
  rules:
    - host: api.example.com
      http:
        paths:
          - path: /hello
            pathType: Prefix
            backend:
              service:
                name: hello-svc
                port:
                  number: 80
~~~

Ingress is being gradually superseded by the newer, more expressive **Gateway API** (see Latest Updates), but Ingress remains the standard most production clusters run today.

### StatefulSet — for workloads that need stable identity

A Deployment's pods are interchangeable — pod-a and pod-b are identical and either can be killed and replaced freely. Databases, message queue brokers, and anything doing leader election need something different: stable, predictable network identity (pod-0, pod-1, pod-2, always in that order) and stable per-pod storage that follows the pod even if it's rescheduled. That's what **StatefulSet** provides.

~~~yaml
apiVersion: apps/v1
kind: StatefulSet
metadata:
  name: postgres
spec:
  serviceName: postgres-headless
  replicas: 3
  selector:
    matchLabels:
      app: postgres
  template:
    metadata:
      labels:
        app: postgres
    spec:
      containers:
        - name: postgres
          image: postgres:16
          volumeMounts:
            - name: data
              mountPath: /var/lib/postgresql/data
  volumeClaimTemplates:              # each pod gets its OWN PersistentVolumeClaim
    - metadata:
        name: data
      spec:
        accessModes: ["ReadWriteOnce"]
        resources:
          requests:
            storage: 10Gi
~~~

Pods are named postgres-0, postgres-1, postgres-2 deterministically, are created and scaled down in order, and each keeps its own PersistentVolumeClaim across restarts — postgres-1's storage follows postgres-1, not some arbitrary volume.

### DaemonSet — one pod per node, automatically

A **DaemonSet** ensures exactly one copy of a pod runs on every node (or every node matching a selector) — the standard pattern for node-level agents: log collectors (Fluentd/Fluent Bit), metrics exporters (node-exporter), or a CNI network plugin's per-node component.

~~~yaml
apiVersion: apps/v1
kind: DaemonSet
metadata:
  name: node-exporter
spec:
  selector:
    matchLabels:
      app: node-exporter
  template:
    metadata:
      labels:
        app: node-exporter
    spec:
      containers:
        - name: node-exporter
          image: prom/node-exporter:latest
~~~

### Jobs and CronJobs — run-to-completion workloads

A **Job** runs a pod to completion (not forever) — for a one-off batch task, a database migration, or a training run. A **CronJob** runs a Job on a schedule.

~~~yaml
apiVersion: batch/v1
kind: CronJob
metadata:
  name: nightly-report
spec:
  schedule: "0 2 * * *"          # 2 AM daily, standard cron syntax
  jobTemplate:
    spec:
      template:
        spec:
          containers:
            - name: report
              image: myorg/report-generator:1.4
          restartPolicy: OnFailure
~~~

### Resource requests and limits

Every container should declare **requests** (what it needs to be scheduled — the scheduler uses this for bin-packing) and **limits** (a hard ceiling the kubelet enforces at runtime).

~~~yaml
resources:
  requests:
    cpu: "250m"          # 250 millicores = a quarter of one CPU core
    memory: "256Mi"
  limits:
    cpu: "500m"
    memory: "512Mi"      # exceeding this triggers an OOMKill (see Common Errors)
~~~

CPU limits throttle (the container keeps running, just slower); memory limits kill the container outright (there is no "slow down" for memory) — this asymmetry is one of the most consequential facts in all of Kubernetes resource management, covered further in Performance.

### Liveness, readiness, and startup probes

~~~yaml
livenessProbe:                  # "is this container alive?" — fail => kubelet restarts it
  httpGet:
    path: /healthz
    port: 8000
  initialDelaySeconds: 10
  periodSeconds: 10
readinessProbe:                 # "is this container ready for traffic?" — fail => removed from Service endpoints, NOT restarted
  httpGet:
    path: /readyz
    port: 8000
  periodSeconds: 5
startupProbe:                   # for slow-starting apps: liveness/readiness are paused until this succeeds
  httpGet:
    path: /healthz
    port: 8000
  failureThreshold: 30
  periodSeconds: 2
~~~

The distinction that trips up almost everyone: liveness failing means "restart me — I'm stuck," readiness failing means "don't send me traffic yet, but don't restart me — I'm just busy or warming up." Wiring a liveness probe to a slow dependency check (a database ping) is a classic anti-pattern — see Anti-Patterns — because a slow database causes healthy pods to be needlessly restarted in a cascading loop.

### Helm — templating and packaging

Writing raw YAML for every environment (dev/staging/prod) means duplicating manifests with tiny differences. **Helm** is Kubernetes' package manager: a "chart" is a templated bundle of manifests plus a values file that parameterizes them.

~~~bash
helm create mychart              # scaffold a chart
helm install myapp ./mychart --set replicaCount=3 --set image.tag=1.4.0
helm upgrade myapp ./mychart --set image.tag=1.5.0   # templated rolling update
helm rollback myapp 1                                 # back to a previous release
~~~

A values.yaml file holds the per-environment differences (replica counts, image tags, resource sizes); the chart's templates reference those values, so the same chart deploys correctly to dev, staging, and prod with only a values override changing.

### Horizontal Pod Autoscaler (HPA) — a first look

~~~yaml
apiVersion: autoscaling/v2
kind: HorizontalPodAutoscaler
metadata:
  name: hello-hpa
spec:
  scaleTargetRef:
    apiVersion: apps/v1
    kind: Deployment
    name: hello-deployment
  minReplicas: 2
  maxReplicas: 10
  metrics:
    - type: Resource
      resource:
        name: cpu
        target:
          type: Utilization
          averageUtilization: 70    # scale out once average CPU crosses 70%
~~~

Covered further, with custom-metric scaling for AI workloads (queue depth, GPU utilization), in Advanced Concepts and Scalability.
`,

  "advanced-concepts": `
### The scheduler's bin-packing decision, precisely

The scheduler assigns each unscheduled Pod to exactly one node in two phases: **filtering** (which nodes even satisfy the pod's requirements — enough free CPU/memory to cover requests, matching node selectors, tolerated taints) and **scoring** (among the nodes that pass filtering, which is the "best" fit — by default favoring balanced resource utilization across the cluster, though this is pluggable). This is a real-time, per-pod bin-packing problem, and it is why setting accurate requests matters: under-declared requests let the scheduler over-pack a node, causing real resource contention once traffic actually arrives.

### Affinity, anti-affinity, and taints/tolerations

~~~yaml
# Anti-affinity: spread replicas across different nodes (or zones) for resilience
affinity:
  podAntiAffinity:
    requiredDuringSchedulingIgnoredDuringExecution:
      - labelSelector:
          matchLabels:
            app: hello
        topologyKey: kubernetes.io/hostname   # never co-locate two replicas on one node
---
# Taints repel pods from a node unless they explicitly tolerate the taint —
# the standard way to dedicate nodes (e.g. GPU nodes) to specific workloads
# kubectl taint nodes gpu-node-1 workload=gpu:NoSchedule
tolerations:
  - key: "workload"
    operator: "Equal"
    value: "gpu"
    effect: "NoSchedule"
nodeSelector:
  gpu: "true"
~~~

For AI infrastructure specifically: dedicating GPU nodes via taints (so only GPU-requesting pods land there, and non-GPU pods are repelled) is the standard pattern, paired with a node selector or nodeAffinity on the pods that actually need a GPU, and increasingly with **Dynamic Resource Allocation (DRA)** — a newer, more expressive API than the old extended-resource GPU counting, purpose-built for heterogeneous accelerators.

### PodDisruptionBudget — protecting availability during voluntary disruption

~~~yaml
apiVersion: policy/v1
kind: PodDisruptionBudget
metadata:
  name: hello-pdb
spec:
  minAvailable: 2          # never voluntarily evict below 2 healthy pods
  selector:
    matchLabels:
      app: hello
~~~

A PDB constrains **voluntary** disruptions — node drains for maintenance, cluster-autoscaler scale-downs — so a rolling node upgrade cannot accidentally take an entire service offline by evicting all its replicas at once. It does nothing for involuntary disruption (a node crashing outright).

### Custom Resource Definitions (CRDs) and the Operator pattern

A CRD teaches the Kubernetes API server an entirely new object kind (say, PostgresCluster or InferenceService) with its own schema, storable and queryable exactly like a built-in Pod or Deployment. An **Operator** is a controller — running the exact same reconciliation loop as every built-in controller (see Internal Working) — that watches instances of that custom resource and drives real-world state (spinning up a database cluster, configuring replication, handling failover) to match. This is how Helm-adjacent but more stateful, domain-specific automation is built: Kubeflow and KServe extend Kubernetes this way for ML training/serving, exactly as the Prometheus Operator does for observability.

### Multi-tenancy: namespaces, quotas, RBAC, and network policy together

A single cluster shared by multiple teams needs four layers working together, not any one alone:

~~~yaml
# ResourceQuota — caps total resource consumption per namespace
apiVersion: v1
kind: ResourceQuota
metadata:
  name: team-quota
  namespace: payments
spec:
  hard:
    requests.cpu: "20"
    requests.memory: 40Gi
    pods: "50"
---
# NetworkPolicy — default-deny, then explicitly allow only what's needed
apiVersion: networking.k8s.io/v1
kind: NetworkPolicy
metadata:
  name: default-deny-ingress
  namespace: payments
spec:
  podSelector: {}
  policyTypes: ["Ingress"]
~~~

Namespaces give logical isolation, ResourceQuotas cap consumption so one team can't starve another, NetworkPolicies restrict which pods may talk to which (by default, every pod can reach every other pod in a cluster — a flat network — which is almost always wrong for a multi-tenant production cluster), and RBAC (see the **RBAC** skill for the full Role/RoleBinding model) restricts who can create, read, or modify objects within a namespace. None of the four is sufficient alone; a namespace with no NetworkPolicy and permissive RBAC gives only cosmetic isolation.

### Admission control

Before an object is persisted to etcd, it passes through **admission controllers** — validating (reject non-compliant objects, e.g. "no image tag may be latest") and mutating (auto-inject a sidecar, default a missing field) webhooks. Pod Security Admission (built-in, replacing the deprecated PodSecurityPolicy) enforces baseline security postures (no privileged containers, no host network access) at this stage; OPA Gatekeeper and Kyverno are the popular general-purpose policy engines teams layer on top for custom organizational rules.

### Decision table: which workload controller

| Need | Object |
|------|--------|
| Stateless, interchangeable replicas | Deployment |
| Stable per-replica identity + storage (databases, brokers) | StatefulSet |
| Exactly one pod per node (agents, log shippers) | DaemonSet |
| Run-to-completion batch work | Job |
| Scheduled run-to-completion work | CronJob |
| Bare, unmanaged single pod (debugging only) | Pod (rarely used directly) |
`,

  "internal-working": `
The single most important internal-working concept in Kubernetes is the **reconciliation loop** (also called a control loop): every controller in the system runs the same three-step pattern, forever, independently and concurrently with every other controller.

~~~mermaid
flowchart LR
    A["Desired state\nwritten to etcd\n(e.g. replicas: 3)"] --> B["Controller OBSERVES\ncurrent actual state\nvia the API server"]
    B --> C{"Actual state ==\nDesired state?"}
    C -->|"No — diff found"| D["Controller ACTS:\ncreate/delete/update\nobjects via the API"]
    D --> A
    C -->|"Yes — in sync"| E["Sleep / wait for\nthe next relevant event"]
    E --> B
~~~

1. **Observe.** A controller watches the API server (via an efficient long-lived "watch" connection, not polling) for objects it cares about — the Deployment controller watches Deployments and ReplicaSets, the Node controller watches Nodes, and so on.
2. **Diff.** It compares the desired state (what's declared in the object's spec, stored in etcd) against the actual observed state (what's really running, reported by kubelet heartbeats and status subresources).
3. **Act.** If they differ, the controller issues API calls to close the gap — create a missing pod, delete an extra one, update a status field — and then goes back to step 1.

This model is why Kubernetes is self-healing at its very core, not as a bolted-on feature: nobody has to notice a crashed pod and manually recreate it, because the ReplicaSet controller's reconciliation loop is continuously checking "are there 3 pods matching this label selector?" and will create a replacement the moment it observes only 2. It is also why the model is **eventually consistent**, not instantaneous — there is always a small window between a state change and full reconciliation, and every controller must be written to be safely re-run any number of times (idempotent), because it will be.

The API server sits in the middle of every single interaction: it validates and persists every write to **etcd** (a distributed, strongly-consistent key-value store — the cluster's single source of truth for all state), and it is the only component that ever talks to etcd directly. Every controller, the scheduler, and every kubelet only ever talk to the API server, never to etcd or to each other directly — this single-front-door design is what keeps the whole system's consistency model tractable, and it's why the API server being unavailable freezes the *control plane* (no new scheduling, no reconciliation) even though already-running pods keep serving traffic uninterrupted (kubelets continue running what they last knew about).

The **scheduler** is itself just another controller running this exact loop, specialized to one job: watch for pods with no assigned node, run the filter/score algorithm (see Advanced Concepts), and write the chosen node name back into the pod's spec via the API server — at which point the kubelet on that node picks it up and actually starts the container.
`,

  architecture: `
### Control plane vs worker nodes

~~~mermaid
flowchart TB
    subgraph CP["Control Plane"]
        API["API Server\n(the single front door; auth, validation, REST)"]
        ETCD[("etcd\ndistributed key-value store —\nthe cluster's source of truth")]
        SCHED["Scheduler\n(assigns pods to nodes)"]
        CM["Controller Manager\n(runs the built-in reconciliation loops:\nDeployment, ReplicaSet, Node, ...)"]
        CCM["Cloud Controller Manager\n(talks to AWS/Azure/GCP APIs for\nLoadBalancers, volumes, nodes)"]
    end
    subgraph N1["Worker Node 1"]
        K1["kubelet\n(talks to API server;\nstarts/stops containers)"]
        KP1["kube-proxy\n(Service virtual IP routing)"]
        CR1["Container runtime\n(containerd / CRI-O)"]
        P1["Pods"]
    end
    subgraph N2["Worker Node N"]
        K2["kubelet"]
        KP2["kube-proxy"]
        CR2["Container runtime"]
        P2["Pods"]
    end
    API <--> ETCD
    SCHED --> API
    CM --> API
    CCM --> API
    K1 <--> API
    K2 <--> API
    K1 --> CR1 --> P1
    K2 --> CR2 --> P2
~~~

The control plane makes decisions; worker nodes execute them. In a managed cluster (EKS/AKS/GKE — see the **AWS**/**Azure**/**GCP** skills), the cloud provider runs and hides the control plane entirely — you never SSH into an API server or etcd node; you only manage worker nodes (or not even those, with fully serverless node pools like Fargate/AKS-serverless).

Each control-plane piece's job: the **API server** authenticates, authorizes (RBAC — see the RBAC skill), validates, and persists every request; **etcd** durably stores all cluster state and is the only thing the API server reads/writes for state; the **scheduler** assigns unscheduled pods to nodes; the **controller manager** runs the built-in reconciliation loops (Deployment, ReplicaSet, Node, Job, and more, all in one binary for efficiency); the **cloud controller manager** is the pluggable seam that lets Kubernetes ask a specific cloud "provision me a LoadBalancer" or "attach this volume" without baking cloud-specific code into core Kubernetes.

Each worker node runs: the **kubelet** (the node agent — registers the node, receives pod specs from the API server, and instructs the container runtime to start/stop/restart containers, running the probes described in Intermediate Concepts); **kube-proxy** (implements Service virtual IPs by programming iptables/IPVS rules so traffic to a Service's IP gets load-balanced to the right pod IPs); and the **container runtime** (containerd or CRI-O, speaking the Container Runtime Interface — the actual process that pulls images and runs containers, the same layer the **Docker** skill's underlying runtime concepts describe).

### Application architecture around Kubernetes

A team's manifests (or Helm chart) typically mirror this layout:

~~~text
myapp/
├── charts/ (or k8s/)
│   ├── base/
│   │   ├── deployment.yaml
│   │   ├── service.yaml
│   │   ├── ingress.yaml
│   │   ├── configmap.yaml
│   │   └── hpa.yaml
│   └── overlays/            # Kustomize-style, or Helm values-*.yaml
│       ├── dev/
│       ├── staging/
│       └── prod/
└── Dockerfile                 # the image these manifests reference (see Docker skill)
~~~

Rule that matters: application code never assumes it knows its own IP, hostname, or that it's the only replica — it reads configuration from ConfigMaps/Secrets/env vars, stores durable state externally (a database, object storage, or a StatefulSet-managed volume), and treats every request as potentially served by a different, interchangeable pod. This is exactly the twelve-factor, cloud-native application design Kubernetes is built to reward.
`,

  "data-flow": `
Tracing exactly what happens from **kubectl apply -f deployment.yaml** to a running, traffic-serving pod:

~~~mermaid
sequenceDiagram
    participant U as kubectl (you)
    participant API as API Server
    participant ETCD as etcd
    participant DC as Deployment Controller
    participant RSC as ReplicaSet Controller
    participant SCHED as Scheduler
    participant KLET as kubelet (chosen node)
    participant CRI as Container runtime

    U->>API: apply Deployment manifest (replicas: 3)
    API->>API: authenticate, authorize (RBAC), validate, admission webhooks
    API->>ETCD: persist Deployment object
    API-->>U: 200 OK

    DC->>API: watch Deployments — sees new/changed Deployment
    DC->>API: create a ReplicaSet (owns it) matching the template
    API->>ETCD: persist ReplicaSet

    RSC->>API: watch ReplicaSets — sees replicas=3, actual pods=0
    RSC->>API: create 3 Pod objects (unscheduled, no nodeName yet)
    API->>ETCD: persist Pod objects

    SCHED->>API: watch for pods with no nodeName
    SCHED->>SCHED: filter + score nodes (requests, taints, affinity)
    SCHED->>API: bind pod to chosen node (sets nodeName)
    API->>ETCD: persist the binding

    KLET->>API: watch for pods assigned to MY node
    KLET->>CRI: pull image, create container, apply resource limits
    CRI-->>KLET: container running
    KLET->>API: report Pod status = Running, update readiness

    Note over API,ETCD: A Service's endpoints controller watches Pod readiness\nand adds the pod's IP to the Service's routable endpoints
~~~

Every arrow into "API" in this diagram is the same REST API — a create, a watch, or a status update, all authenticated and authorized identically. The most important lesson to take from this trace: **no component ever talks directly to another component's internals.** The Deployment controller doesn't create pods itself and doesn't know which node they'll land on; the scheduler doesn't start containers; the kubelet doesn't decide replica counts. Each piece does one narrow job and communicates exclusively through the API server writing to etcd — which is precisely the reconciliation-loop architecture from Internal Working, now shown end to end for one real request.

Once the pod is Running and passes its readiness probe, the Service's endpoint controller adds its IP to the Service's backend list, and kube-proxy's iptables/IPVS rules on every node start routing a share of Service traffic to it — completing the path from "kubectl apply" to "actually receiving production traffic."
`,

  "production-usage": `
### Managed vs self-hosted control planes

The overwhelming majority of production Kubernetes today runs on a **managed control plane** — Amazon EKS, Azure AKS, or Google GKE (see the **AWS**, **Azure**, and **GCP** skills for each) — where the cloud provider operates the API server, etcd, scheduler, and controller manager, and you only manage (or don't even manage, with serverless node options) worker nodes. Self-hosting the control plane (kubeadm, or a from-scratch setup like the classic "Kubernetes the Hard Way" exercise) remains valuable for learning internals deeply and for specific on-premises/air-gapped requirements, but is rare for a new production workload in 2026.

### Provisioning the cluster as code

Real teams do not click through a cloud console to create a cluster. The **Terraform** skill's infrastructure-as-code approach — a Terraform module describing the VPC, node pools, IAM roles, and the managed Kubernetes control plane itself — is the standard so that cluster creation is reviewable, repeatable, and reproducible across environments (dev/staging/prod), exactly like application code.

### GitOps: Git as the source of truth for cluster state

Rather than engineers running kubectl apply from their laptops, mature teams adopt **GitOps**: a Git repository holds the desired manifests (or Helm values), and a controller running inside the cluster — **ArgoCD** or **Flux** are the two dominant tools — continuously reconciles the live cluster to match what's in Git, exactly mirroring Kubernetes' own internal reconciliation-loop philosophy one layer up. A merged pull request to the manifests repo is the deployment; there is no separate "run this deploy script" step, and drift (someone manually kubectl edit-ing a live object) gets automatically detected and reverted. This pairs naturally with the **CI/CD**, **GitHub Actions**, and **Jenkins** skills: CI builds and tests the image and pushes it to a registry; GitOps (not the CI pipeline itself) applies the resulting manifest change to the cluster.

### Everyday tooling

- **kubectl** — the baseline CLI, used directly or via aliases/plugins (kubectx/kubens for fast context/namespace switching).
- **k9s** — a terminal UI for browsing and acting on cluster objects interactively; extremely popular for day-to-day operations.
- **Kustomize** — built into kubectl, for overlay-based environment variation without full templating (an alternative or complement to Helm).
- **Helm** — the templating/packaging standard (see Intermediate Concepts); most third-party software (Prometheus, cert-manager, ingress-nginx) ships as a Helm chart.

### Operational defaults worth adopting from day one

- One namespace per environment/team at minimum, with ResourceQuotas and NetworkPolicies from the start, not retrofitted later.
- Every manifest reviewed through the same pull-request process as application code — the cluster's desired state lives in version control (see **Git**), not in someone's shell history.
- A staging cluster (or at minimum a staging namespace with realistic traffic shape) that mirrors production configuration closely enough that a rollout there is a meaningful signal.
`,

  "industry-examples": `
- **Google**: the origin story itself — Kubernetes is the open-source distillation of a decade of Borg running effectively all of Google's internal and customer-facing services; GKE remains one of the most mature managed offerings, unsurprisingly.
- **Spotify**: migrated its backend microservices fleet (thousands of services) onto Kubernetes to replace an older, more bespoke internal deployment system, citing faster developer iteration and more consistent operational tooling across teams.
- **Airbnb**: runs its service infrastructure on Kubernetes and has been vocal about the platform-engineering layer (internal tooling, golden paths) built on top to make Kubernetes usable by product engineers who don't want to hand-write YAML.
- **Shopify**: operates a large multi-tenant Kubernetes footprint to handle extreme, highly seasonal traffic spikes (Black Friday/Cyber Monday), leaning heavily on autoscaling and careful capacity planning discussed in Scalability.
- **OpenAI and Anthropic-style AI infrastructure** (industry-wide pattern, not a single public case study): model inference services are commonly deployed as Kubernetes Deployments fronting GPU node pools, with custom-metric HPAs scaling on queue depth or GPU utilization rather than plain CPU — the direct AI-engineering application of everything on this page.
- **Pinterest**: an early, widely cited adopter that migrated from a mix of bespoke deployment tooling to Kubernetes to standardize how hundreds of services get deployed, scaled, and observed.

The pattern across all of them: Kubernetes becomes the common substrate that lets a platform team build one set of tools (CI/CD integration, observability, autoscaling policy) that works uniformly across every product team's services, instead of each team reinventing deployment infrastructure independently.
`,

  "best-practices": `
1. **Always set resource requests, and set limits deliberately.** Unset requests break scheduler bin-packing (see Advanced Concepts and Anti-Patterns); unset memory limits let one runaway pod starve its node's neighbors.
2. **Never deploy a mutable image tag like latest.** Pin to an immutable, content-addressed tag or digest so a rollback actually rolls back to known bytes, not "whatever latest resolves to now."
3. **Run at least two replicas of anything user-facing**, spread across nodes/zones with pod anti-affinity, so a single node failure never fully takes down a service.
4. **Wire liveness and readiness probes correctly and distinctly** — liveness for "restart me," readiness for "don't send me traffic yet" — never point both at the same slow, dependency-heavy check (see Anti-Patterns).
5. **Treat manifests as code**: version-controlled, code-reviewed, ideally applied only via GitOps (ArgoCD/Flux), never via ad hoc kubectl edit against a live cluster.
6. **Default every namespace to network-policy-deny, then explicitly allow** required traffic — a flat, fully-open pod network is the default and is wrong for anything beyond a personal sandbox.
7. **Use namespaces plus ResourceQuotas for every team/tenant sharing a cluster**, not as an afterthought once someone's runaway job starves everyone else.
8. **Handle SIGTERM gracefully in your application** — drain in-flight requests within terminationGracePeriodSeconds before exiting, so rolling updates and scale-downs don't drop live traffic.
9. **Prefer a small number of well-tested Helm charts (or Kustomize bases) over hand-copied YAML** per environment — configuration drift between "prod.yaml" and "staging.yaml" that were never meant to diverge is a constant real-world source of incidents.
10. **Set a PodDisruptionBudget on anything that must stay available during voluntary disruptions** (node upgrades, cluster-autoscaler scale-downs).
11. **Scan images and enforce a non-root, read-only-filesystem security context by default** (see Security) — bake this into your base Dockerfile/Helm chart once, not per-team per-service.
12. **Autoscale on a metric that actually reflects load** (queue depth, requests-per-second, GPU utilization) rather than CPU alone when CPU isn't the real bottleneck — plain CPU-based HPA is a reasonable default, not a universal answer.
`,

  "anti-patterns": `
### No resource requests/limits

~~~yaml
# WRONG — the scheduler has no idea how much this pod actually needs;
# it can over-pack a node, and a leak has no ceiling
containers:
  - name: api
    image: myorg/api:1.4

# RIGHT — explicit, right-sized requests/limits informed by real profiling
containers:
  - name: api
    image: myorg/api:1.4
    resources:
      requests: { cpu: "250m", memory: "256Mi" }
      limits: { cpu: "500m", memory: "512Mi" }
~~~

### Liveness probe pointed at a slow downstream dependency

~~~yaml
# WRONG — if the database is briefly slow, EVERY healthy pod's liveness probe
# times out simultaneously and kubelet restarts them all — a self-inflicted outage
livenessProbe:
  httpGet: { path: /healthz, port: 8000 }   # /healthz internally pings the DB

# RIGHT — liveness checks only "is this process itself alive" (no external calls);
# readiness is the place for dependency checks, since failing readiness only
# removes the pod from traffic instead of killing it
livenessProbe:
  httpGet: { path: /healthz, port: 8000 }   # /healthz: process up, no external calls
readinessProbe:
  httpGet: { path: /readyz, port: 8000 }    # /readyz: checks DB/cache connectivity
~~~

### Running as root with a mutable filesystem

~~~yaml
# WRONG — default container security posture; a compromised process can
# write anywhere and potentially escalate on the host
containers:
  - name: api
    image: myorg/api:1.4

# RIGHT — explicit least-privilege security context
containers:
  - name: api
    image: myorg/api:1.4
    securityContext:
      runAsNonRoot: true
      readOnlyRootFilesystem: true
      allowPrivilegeEscalation: false
~~~

### Other production-grade anti-patterns

- **Single replica for anything that matters** — one pod means one node failure equals full downtime; there is no self-healing story for a Deployment with replicas: 1.
- **Ignoring SIGTERM in the application** — the kubelet sends SIGTERM and waits terminationGracePeriodSeconds before SIGKILL during a rolling update or scale-down; an app that doesn't drain in-flight requests during that window drops traffic on every routine deploy.
- **Hand-editing live objects with kubectl edit/patch** instead of updating the source manifest — the next GitOps sync or kubectl apply from the old file silently reverts the change, and nobody can explain why "it worked yesterday."
- **A cluster-wide, permissive NetworkPolicy-free network** in a genuinely multi-tenant cluster — any pod can reach any other pod by default, turning one compromised low-value service into a lateral-movement launchpad.
- **Storing secrets as plain ConfigMap data or committed directly in manifests** — Secrets are base64-encoded, not encrypted, by default; treat them accordingly (see Security) and never commit raw credentials to Git.
- **Cramming unrelated containers into one Pod** instead of separate Deployments — Pods scale, restart, and get scheduled as a single unit; two unrelated services in one Pod couples their failure and scaling behavior for no benefit.
- **Skipping a staging environment that mirrors production configuration** — testing a Helm chart change only in a bare-bones dev namespace, then discovering it fails against real ResourceQuotas, NetworkPolicies, or scale in production.
`,

  performance: `
### Measure first

~~~bash
kubectl top nodes                       # requires metrics-server: node CPU/memory usage
kubectl top pods -n payments            # per-pod CPU/memory usage right now
kubectl describe node <node>            # allocatable vs allocated resources, and why a pod won't schedule
~~~

For anything beyond a quick spot-check, **Prometheus** (see the **Prometheus** skill) scraping kube-state-metrics and node-exporter, visualized in **Grafana** (see the **Grafana** skill), is the standard production visibility layer — kubectl top only shows an instantaneous snapshot, not trends or history.

### The optimization hierarchy

1. **Right-size requests/limits from real profiling data**, not guesses. Over-requesting wastes cluster capacity (and money on a managed cloud cluster); under-requesting causes real contention once traffic arrives — both are common, and both are fixable by looking at actual kubectl top / Prometheus history over a representative window.
2. **Reduce image size and pull time.** A smaller, layer-cache-friendly image (see the **Docker** skill's multi-stage build guidance) starts faster, which matters directly for autoscaling responsiveness and rolling-update speed.
3. **Tune probe timings** so they reflect real startup/response characteristics — an initialDelaySeconds too short causes needless restart churn during normal, slightly slow startup; too long delays detecting a genuinely stuck container.
4. **Use topology spread constraints / anti-affinity** to avoid hot-spotting — several replicas landing on the same node or zone defeats the purpose of having replicas at all when that node/zone has a problem.
5. **Scale on the metric that reflects real load**, not always CPU — for many AI inference workloads, queue depth or in-flight-request count predicts saturation far better than CPU percentage, especially for GPU-bound work where CPU can look idle while the GPU is saturated.
6. **Consider Vertical Pod Autoscaler (VPA)** to recommend or automatically apply better requests/limits based on observed usage history, especially useful for right-sizing workloads whose resource needs were originally guessed.
7. **At the cluster level, use node pools sized for the workload shape** — a mixed pool of general-purpose and GPU nodes, with taints/tolerations (see Advanced Concepts) directing the right pods to the right hardware, rather than one undifferentiated node pool.

### Concrete numbers worth internalizing

CPU limits throttle (a container hitting its CPU limit just runs slower — it is not killed), while memory limits are a hard kill (a container exceeding its memory limit is OOMKilled immediately, with no graceful degradation). This asymmetry means memory limits deserve more conservative headroom than CPU limits in almost every real workload.
`,

  scalability: `
Kubernetes scales along three largely independent axes: pods (Horizontal Pod Autoscaler), pod resource sizing (Vertical Pod Autoscaler), and nodes (Cluster Autoscaler) — a senior engineer reasons about all three together, not just replica count.

~~~mermaid
flowchart TB
    Metrics["Metrics source:\nCPU/memory, or custom\n(queue depth, RPS, GPU util)"] --> HPA["Horizontal Pod Autoscaler\nadjusts replica count"]
    HPA --> Deploy["Deployment"]
    Deploy -->|"more pods than\ncurrent nodes fit"| Pending["Pods stuck Pending"]
    Pending --> CA["Cluster Autoscaler\nadds nodes"]
    CA --> NewNode["New node joins\n(cloud API call)"]
    NewNode --> Sched["Scheduler places\npending pods"]
    VPA["Vertical Pod Autoscaler\n(recommends/applies\nbetter requests/limits)"] -.tunes.-> Deploy
~~~

### Horizontal scaling for AI workloads specifically

For an inference service, custom-metric HPA (scaling on request queue depth or p95 latency rather than plain CPU) captures load far better, since a GPU-bound model server can show low CPU while the GPU itself is the actual bottleneck. This typically requires an adapter (Prometheus Adapter, or KEDA for event/queue-driven scaling) feeding the HPA a metric beyond the built-in CPU/memory ones.

### Known bottlenecks and answers

| Bottleneck | Answer |
|------------|--------|
| Pods Pending because no node has capacity | Cluster Autoscaler adds nodes; or pre-provision a larger node pool for predictable spikes |
| CPU-based HPA doesn't react to the real bottleneck (GPU, queue depth) | Custom-metric HPA via Prometheus Adapter, or KEDA for event-source-driven scaling |
| Slow rolling updates under load | Tune maxSurge/maxUnavailable in the Deployment's rolling-update strategy; ensure readiness probes are accurate so new pods aren't marked ready prematurely |
| A single StatefulSet workload (e.g. one database) can't scale horizontally | Vertical scaling (bigger node/pod), or a database-native sharding/replication topology — Kubernetes doesn't solve data-layer scaling for you |
| Cross-region/multi-cluster traffic routing | A service mesh or a global load balancer in front of multiple clusters — beyond a single cluster's native scope |
| etcd write throughput under very large clusters | Etcd is the control-plane's ceiling at extreme cluster sizes; managed offerings tune this, self-hosted clusters must monitor etcd latency directly |

Vertically, a pod can only grow as large as a single node's spare capacity allows, and historically resizing a running pod's requests/limits required recreating it — **in-place pod resource resizing** (maturing through recent Kubernetes releases) is closing that gap, letting some resource changes apply without a disruptive restart.
`,

  security: `
### Kubernetes-specific attack surface

1. **Overly permissive RBAC.** The single most common real-world Kubernetes security finding is a ServiceAccount or user bound to cluster-admin (or an overly broad ClusterRole) when a narrow, namespaced Role would do. This page intentionally does not re-derive the full Role/ClusterRole/RoleBinding model — see the **RBAC** skill's Advanced Concepts section, which uses Kubernetes RBAC as its own worked example; apply least privilege there exactly as you would for any RBAC system.
2. **A flat, unrestricted pod network.** With no NetworkPolicy, any pod can reach any other pod (and often external services) — a compromised low-value pod becomes a lateral-movement foothold. Default-deny NetworkPolicies, then explicit allows, close this (see Advanced Concepts).
3. **Secrets are base64, not encryption.** A Kubernetes Secret is trivially decodable by anyone who can read the object — encryption at rest for etcd, and ideally an external secrets manager (see the **Secrets Management** skill) synced in via an operator (External Secrets Operator or cloud-provider equivalents), is the production answer, not relying on Secret's default encoding as if it were confidentiality.
4. **Privileged or root containers.** A container running as root, or with privileged: true, that is compromised has a dramatically larger blast radius, potentially reaching the host itself. Pod Security Admission's "restricted" profile (or an equivalent policy engine rule) should be the default posture, not an opt-in.
5. **Supply-chain risk in images.** An unscanned, unpinned base image can carry known CVEs or, worse, be an entirely malicious image pulled from an untrusted registry — see the **Docker** skill for image scanning and provenance, and pin to digests, not mutable tags.
6. **Unrestricted API server access.** The API server is the single front door to the entire cluster's state — network-restricting who can even reach it (private endpoints on managed clusters, VPN/bastion access for self-hosted ones) is as important as what RBAC allows once someone is authenticated.
7. **Unencrypted etcd and unencrypted in-cluster traffic.** etcd holds every Secret in the cluster; encryption at rest for etcd and mTLS for in-cluster traffic (commonly via a service mesh, or the CNI's native support) close two different but related gaps.

### Defenses, concretely

- Apply the principle of least privilege to every ServiceAccount and human RBAC binding — narrow, namespaced Roles by default, cluster-admin as a rare, audited exception (see the **RBAC** skill).
- Default every namespace to network-policy-deny, allowing only known, necessary traffic paths.
- Enforce Pod Security Admission's restricted profile (or an OPA Gatekeeper/Kyverno policy) cluster-wide, not per-team opt-in.
- Scan images in CI before they ever reach a cluster (see the **CI/CD**, **GitHub Actions**, and **Jenkins** skills for where this gate belongs in the pipeline), and pin deployments to image digests.
- Sync real secrets from a dedicated secrets manager rather than hand-authoring Kubernetes Secret objects with sensitive values in Git.
- Enable etcd encryption at rest and audit logging on the API server, and actually review the audit log, not just collect it.

See the **RBAC**, **Secrets Management**, **OWASP Top 10**, and **Docker** skills for the surrounding security context this page assumes rather than re-derives.
`,

  testing: `
### Testing manifests and charts before they reach a cluster

~~~bash
kubeconform -summary -strict manifests/*.yaml   # schema-validate manifests offline, fast, in CI
helm lint ./mychart                              # catch template/chart mistakes before rendering
helm template ./mychart --values values-prod.yaml | kubeconform -strict   # render + validate
~~~

### Policy testing

~~~bash
# Conftest runs OPA/Rego policies against rendered manifests in CI —
# e.g. "reject any Deployment with no resource limits" as an automated gate
conftest test manifests/deployment.yaml -p policy/
~~~

### Integration testing against a real (local) cluster

~~~bash
kind create cluster --name test          # a real, disposable Kubernetes cluster in Docker, seconds to boot
kubectl apply -f manifests/
kubectl wait --for=condition=Available deployment/hello-deployment --timeout=60s
# ... run integration/smoke tests against the exposed service ...
kind delete cluster --name test
~~~

kind (Kubernetes IN Docker) or minikube give a real API server, scheduler, and kubelet behavior for CI-friendly integration testing, catching classes of bugs (a bad probe, a missing RBAC rule, a misconfigured NetworkPolicy) that pure manifest-linting cannot.

### Helm chart tests

~~~yaml
# templates/tests/test-connection.yaml — runs as part of "helm test"
apiVersion: v1
kind: Pod
metadata:
  name: "{{ .Release.Name }}-test-connection"
  annotations:
    "helm.sh/hook": test
spec:
  containers:
    - name: wget
      image: busybox
      command: ["wget", "myapp-svc:80"]
  restartPolicy: Never
~~~

### The senior testing doctrine

- Validate every manifest/chart change in CI before it can be merged, using the same tools (kubeconform, helm lint, Conftest policies) on every pull request — catching a missing resource limit or a forbidden privileged: true at review time, not in an incident.
- Test rollout behavior deliberately: deploy a deliberately-broken image version to a disposable kind cluster and confirm readiness probes correctly keep it out of rotation, and that a rollback genuinely restores the previous good state.
- Canary or blue-green a real production rollout for anything high-risk, routing a small percentage of real traffic before a full rollout — this is a deployment-strategy decision layered on top of, not replacing, the Deployment object's own rolling-update mechanics.
- Load test against a staging environment configured with the same ResourceQuotas, NetworkPolicies, and replica topology as production — a load test against an unconstrained dev namespace tells you little about production behavior.
`,

  debugging: `
### The escalation path, in order

~~~bash
kubectl get pods -n <ns>                    # 1. what's the pod's status? Pending/CrashLoopBackOff/Running?
kubectl describe pod <pod> -n <ns>          # 2. events section at the bottom — the single richest debugging signal
kubectl logs <pod> -n <ns>                  # 3. container stdout/stderr
kubectl logs <pod> -n <ns> --previous       # 3b. logs from the PREVIOUS instance, essential after a crash/restart
kubectl exec -it <pod> -n <ns> -- sh        # 4. a shell inside the running container, if it has one
kubectl get events -n <ns> --sort-by=.lastTimestamp  # 5. cluster-wide recent events, useful for scheduling failures
kubectl port-forward <pod> 8080:80 -n <ns>  # 6. reach a pod directly, bypassing Service/Ingress, to isolate the layer
~~~

1. **Check the pod's phase first.** Pending means scheduling hasn't happened (check describe's events for "insufficient cpu/memory" or an unmet nodeSelector/taint); CrashLoopBackOff means the container starts and exits repeatedly (check logs --previous); ImagePullBackOff means the registry/tag/credentials are wrong (see Common Errors for each).
2. **kubectl describe's Events section is the first real diagnostic**, not logs — it shows scheduling decisions, probe failures, and image pull attempts in one place, often pinpointing the problem before you even look at application logs.
3. **Logs from the previous instance** are essential once a container has already restarted — the current instance's logs may only contain a few seconds of startup, while --previous holds the crash that actually explains what happened.
4. **kubectl exec** for live inspection — check environment variables actually landed correctly, confirm a mounted ConfigMap/Secret has the expected content, or manually curl a dependency from inside the pod's network namespace.
5. **port-forward to isolate layers** — if a Service or Ingress isn't routing correctly, port-forwarding directly to a pod tells you whether the pod itself is healthy (isolating the problem to the Service/Ingress layer) or whether the pod itself is the actual issue.
6. **For control-plane-level mysteries** (a pod stuck Pending with no obvious reason, a stuck rollout), check the Deployment/ReplicaSet's own describe output and conditions field — the reconciliation loop's own state is visible there.

### Debugging a stuck rollout specifically

~~~bash
kubectl rollout status deployment/hello-deployment    # is it progressing, or stuck?
kubectl rollout history deployment/hello-deployment    # prior revisions
kubectl rollout undo deployment/hello-deployment       # roll back to the previous revision
~~~

A rollout stuck partway almost always means new pods are failing readiness — describe the new ReplicaSet's pods directly rather than only looking at the Deployment's summary status.
`,

  monitoring: `
Kubernetes production visibility rests on the same three pillars as any distributed system (see the **Prometheus**, **Grafana**, and **OpenTelemetry** skills for depth), plus Kubernetes-specific signals.

### Metrics

~~~python
# A FastAPI app exposing Prometheus metrics — scraped by Prometheus via a
# ServiceMonitor or a scrape annotation on the pod/Service
from prometheus_client import Counter, Histogram, make_asgi_app

REQUESTS = Counter("http_requests_total", "Requests", ["route", "status"])
LATENCY = Histogram("http_request_seconds", "Latency", ["route"])

metrics_app = make_asgi_app()   # mount at /metrics for Prometheus to scrape
~~~

~~~yaml
apiVersion: v1
kind: Service
metadata:
  name: hello-svc
  annotations:
    prometheus.io/scrape: "true"
    prometheus.io/port: "8000"
    prometheus.io/path: "/metrics"
~~~

**kube-state-metrics** exposes cluster object state as Prometheus metrics (deployment replica counts vs desired, pod restart counts, PVC status) — distinct from **metrics-server**, which only exposes point-in-time CPU/memory for kubectl top and the HPA. Both are standard Prometheus scrape targets in a production cluster.

### What to actually watch

- **Application-level RED metrics** (Rate, Errors, Duration) per service, exactly as in any other production system.
- **Pod restart counts and OOMKill events** — a rising restart count on a specific Deployment is often the earliest signal of a memory leak or an undersized limit.
- **HPA current vs desired replicas**, and how close current replicas sit to maxReplicas — pinned at maxReplicas under sustained load is a capacity-planning signal, not just a scaling success.
- **Node-level pressure conditions** (MemoryPressure, DiskPressure) — a node under pressure starts evicting pods, and understanding why (see Common Errors: Evicted) prevents mistaking an eviction storm for an application bug.
- **etcd latency**, for anyone operating the control plane themselves — degraded etcd latency degrades every reconciliation loop in the cluster simultaneously.

### Tracing

OpenTelemetry auto-instrumentation (see the **OpenTelemetry** skill) traces a request across pod boundaries — essential once a single user request fans out across several microservices, showing exactly which hop in the chain, running on which pod, contributed the latency.
`,

  deployment: `
### The worked example: a FastAPI backend, fully deployed

This is the reference shape this platform's own backend (or any FastAPI service) would use in production — a Deployment, Service, Ingress, ConfigMap, and Secret working together, with per-line justification.

~~~yaml
# configmap.yaml — non-sensitive configuration, decoupled from the image
apiVersion: v1
kind: ConfigMap
metadata:
  name: api-config
data:
  LOG_LEVEL: "info"
  ALLOWED_ORIGINS: "https://app.example.com"
---
# secret.yaml — sensitive values, kept out of the ConfigMap and out of the image
apiVersion: v1
kind: Secret
metadata:
  name: api-secret
type: Opaque
stringData:
  DATABASE_URL: "postgresql://api:REPLACE-ME@postgres:5432/appdb"
---
# deployment.yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: api
  labels:
    app: api
spec:
  replicas: 3                        # never 1 in production — see Best Practices
  selector:
    matchLabels: { app: api }
  strategy:
    rollingUpdate:
      maxUnavailable: 0              # never drop below full desired capacity mid-rollout
      maxSurge: 1                    # add one extra pod at a time while rolling
    type: RollingUpdate
  template:
    metadata:
      labels: { app: api }
    spec:
      containers:
        - name: api
          image: myorg/api:1.4.2     # pinned, immutable tag — never :latest
          ports:
            - containerPort: 8000
          envFrom:
            - configMapRef: { name: api-config }
            - secretRef: { name: api-secret }
          resources:
            requests: { cpu: "250m", memory: "256Mi" }
            limits: { cpu: "500m", memory: "512Mi" }
          livenessProbe:
            httpGet: { path: /healthz, port: 8000 }
            initialDelaySeconds: 10
          readinessProbe:
            httpGet: { path: /readyz, port: 8000 }
            periodSeconds: 5
          securityContext:
            runAsNonRoot: true
            readOnlyRootFilesystem: true
            allowPrivilegeEscalation: false
      terminationGracePeriodSeconds: 30   # gives the app time to drain in-flight requests on SIGTERM
---
# service.yaml
apiVersion: v1
kind: Service
metadata:
  name: api-svc
spec:
  selector: { app: api }
  ports:
    - port: 80
      targetPort: 8000
---
# ingress.yaml
apiVersion: networking.k8s.io/v1
kind: Ingress
metadata:
  name: api-ingress
  annotations:
    cert-manager.io/cluster-issuer: letsencrypt-prod   # automated TLS certificate issuance
spec:
  tls:
    - hosts: ["api.example.com"]
      secretName: api-tls
  rules:
    - host: api.example.com
      http:
        paths:
          - path: /
            pathType: Prefix
            backend:
              service:
                name: api-svc
                port: { number: 80 }
~~~

Why each choice matters: **replicas: 3 with maxUnavailable: 0** guarantees full capacity throughout a rollout, not just after it; **pinned image digest/tag** makes rollbacks meaningful and deployments reproducible; **envFrom ConfigMap/Secret** keeps the image identical across environments; **distinct liveness/readiness probes** avoid the cascading-restart anti-pattern from earlier sections; **explicit requests/limits** feed the scheduler and cap blast radius; **the security context** enforces least privilege by default; **terminationGracePeriodSeconds** paired with application-level SIGTERM handling is what makes a rolling update traffic-safe.

### CI/CD pipeline shape

Build image → run tests → scan image → push to registry → (GitOps controller detects the new tag in a values file, or CI updates it directly) → ArgoCD/Flux reconciles the cluster to the new desired state → rolling update proceeds with the probes above gating each new pod. See the **CI/CD**, **GitHub Actions**, and **Jenkins** skills for the pipeline mechanics that precede this deployment step.
`,

  "production-checklist": `
Before a Kubernetes-hosted service takes real production traffic:

- [ ] Every container has explicit resource requests AND limits, sized from real profiling
- [ ] Image is pinned to an immutable tag or digest — never latest
- [ ] Liveness and readiness probes are distinct, and neither points at a slow external dependency from liveness
- [ ] replicas is at least 2 (ideally 3+) with pod anti-affinity spreading them across nodes/zones
- [ ] A PodDisruptionBudget protects minimum availability during voluntary disruptions
- [ ] terminationGracePeriodSeconds is set and the application actually handles SIGTERM by draining in-flight work
- [ ] Namespace has a ResourceQuota and a default-deny NetworkPolicy with explicit allows
- [ ] RBAC bindings for this workload's ServiceAccount follow least privilege (see the RBAC skill)
- [ ] Secrets come from a real secrets manager or are at minimum encrypted at rest in etcd — never committed to Git in plaintext
- [ ] Security context enforces runAsNonRoot, readOnlyRootFilesystem, and no privilege escalation
- [ ] Prometheus metrics are exposed and scraped; dashboards exist in Grafana for RED metrics and restart counts
- [ ] An HPA (or a documented, deliberate decision not to autoscale) is configured on a metric that reflects real load
- [ ] Manifests/Helm chart live in version control and are applied via CI/CD or GitOps, not ad hoc kubectl apply
- [ ] A rollback procedure has been tested at least once (kubectl rollout undo or the Helm/ArgoCD equivalent) before it's needed for real
- [ ] Staging environment mirrors production's ResourceQuota, NetworkPolicy, and replica topology closely enough to be a meaningful signal
- [ ] Runbook exists: how to read the dashboards, how to scale up manually in an emergency, how to roll back
`,

  "common-mistakes": `
1. **Deploying without resource requests/limits** — the scheduler and kubelet have no basis for correct bin-packing or containment, and a single leaking pod can starve its whole node.
2. **Conflating liveness and readiness** — pointing both at the same dependency-heavy health check causes a slow downstream dependency to trigger a self-inflicted mass-restart storm across every replica simultaneously.
3. **Assuming a Service load-balances perfectly evenly** — kube-proxy's default iptables mode does simple randomized selection, not connection-aware balancing; a small number of long-lived connections can still land unevenly.
4. **Treating a live cluster as the source of truth** instead of the manifest/Git repo — a hand-edited object gets silently reverted by the next apply/GitOps sync, and nobody remembers why.
5. **Ignoring SIGTERM in application code** — the kubelet's grace period exists specifically so the app can drain in-flight requests; an app that exits immediately (or ignores the signal entirely, forcing a SIGKILL after the grace period) drops live traffic on every routine rollout or scale-down.
6. **Running a stateful workload as a Deployment instead of a StatefulSet** — losing stable network identity and per-replica storage the moment a pod is rescheduled, then being surprised when "the database" appears to have amnesia.
7. **No NetworkPolicy in a genuinely shared, multi-tenant cluster** — assuming namespace boundaries alone provide network isolation, when by default every pod can reach every other pod cluster-wide.
8. **Debugging by staring at kubectl get pods alone** — skipping kubectl describe's Events section, which usually contains the actual root cause (a failed scheduling constraint, a probe failure, an image pull error) faster than any other single command.
9. **Sizing an HPA around CPU alone for a workload whose real bottleneck is elsewhere** (GPU utilization, queue depth, memory) — the HPA scales confidently on the wrong signal and the service still falls over under real load.
10. **Under-provisioning etcd/control-plane resources on a self-hosted cluster** and being surprised when reconciliation across the entire cluster slows down simultaneously — etcd latency is a cluster-wide dependency, not a per-workload concern.
`,

  "common-errors": `
| Error / Status | Typical cause | Fix |
|------|----------------|-----|
| CrashLoopBackOff | Container starts then exits (bad config, missing env var, app crash on boot) | kubectl logs --previous; fix the root cause, not just restart |
| ImagePullBackOff / ErrImagePull | Wrong image name/tag, private registry auth missing, network blocked | Verify the image reference; check imagePullSecrets |
| Pending (pod never schedules) | No node has enough free requests, or an unmet nodeSelector/taint/affinity | kubectl describe pod — read the Events section for the exact scheduling reason |
| OOMKilled | Container exceeded its memory limit | Profile real usage; raise the limit or fix a leak — memory limits are a hard kill, not a throttle |
| CreateContainerConfigError | Referenced ConfigMap/Secret key doesn't exist | Verify the ConfigMap/Secret name and key spelling match exactly |
| Evicted | Node under DiskPressure/MemoryPressure; kubelet evicted lower-priority pods | Check node conditions; add capacity, set requests correctly, or set PriorityClass appropriately |
| 0/3 nodes are available (scheduling failure text) | Taints without matching tolerations, or resource requests exceeding all nodes' capacity | Read the exact reason in describe's Events; adjust tolerations or node sizing |
| Readiness probe failed, marking pod as not ready | Dependency (DB, cache) unreachable, or app still warming up | Check the dependency; tune initialDelaySeconds/periodSeconds; use a startupProbe for slow boots |
| ServiceUnavailable / connection refused through a Service | No pods currently match the Service's selector, or none are Ready | kubectl get endpoints <svc> — an empty list means no healthy backend exists |
| Forbidden (RBAC) | ServiceAccount/user lacks the required verb/resource in any bound Role | See the RBAC skill; kubectl auth can-i checks exactly this |

The habit that matters: kubectl describe's Events section is almost always faster than logs for scheduling/config-level failures, while kubectl logs (with --previous after a crash) is the right tool once the container is confirmed to be actually starting and then failing on its own.
`,

  faqs: `
**Q: Do I need Kubernetes if I only run a handful of containers?**
Probably not yet. Kubernetes' value curve is steep at small scale (real operational complexity) and pays off once you have enough services, enough traffic variability, or enough team members that manual container management becomes the bottleneck. A single Docker Compose setup, or a simpler managed container service, is often the right call below that threshold.

**Q: Should I self-host the control plane or use a managed offering?**
Use a managed offering (EKS/AKS/GKE) for essentially all new production workloads — see the AWS/Azure/GCP skills. Self-hosting is worth learning deeply for internals understanding and specific on-premises requirements, but it adds real operational burden most teams shouldn't take on by default.

**Q: Kubernetes RBAC — do I need to learn it separately here?**
This page deliberately doesn't re-derive the full Role/ClusterRole/RoleBinding model — the RBAC skill covers Kubernetes RBAC in depth as its own worked example of the general RBAC pattern. Read that skill's Advanced Concepts section for the manifests and reasoning; this page focuses on how RBAC fits into the broader multi-tenancy and security picture.

**Q: Ingress or Gateway API?**
Ingress remains the standard most production clusters run today and is what you should learn first. Gateway API is the more expressive, eventual successor (see Latest Updates and Future Roadmap) — worth being aware of, not yet a hard requirement for most teams.

**Q: Do I need a service mesh (Istio/Linkerd)?**
Only once you need mTLS between services, fine-grained traffic-shaping (canary weights, retries, circuit breaking) beyond what Ingress and the Deployment's own rolling-update strategy give you, or deep per-service traffic observability. Many production clusters run happily without one; adding a mesh is real added operational complexity, not a default best practice.

**Q: How is Kubernetes different from just "Docker at scale"?**
Docker packages and runs one container on one host. Kubernetes decides which of many hosts runs which of many containers, heals failures automatically, exposes stable networking for a fleet of ephemeral pods, and reconciles all of it continuously against a declared desired state — a genuinely different, higher-level problem than Docker alone addresses (see the Docker skill for where that boundary sits).

**Q: What's the single most common real-world Kubernetes production incident?**
A close race between two: missing/incorrect resource limits causing noisy-neighbor contention or OOMKills, and a misconfigured liveness probe causing a self-inflicted restart storm. Both are covered explicitly in Anti-Patterns and Common Mistakes because they are that common.
`,

  "interview-questions": `
**Junior/Mid:**

1. *What problem does Kubernetes solve that Docker alone doesn't?* Docker runs one container on one host; Kubernetes decides placement across many hosts, restarts failed containers, load-balances across a changing set of pod IPs, and reconciles a declared desired state continuously — orchestration at fleet scale, not single-host container execution.
2. *What is a Pod, and why isn't a container scheduled directly?* A Pod is the smallest deployable unit — one or more containers sharing network/storage namespaces. Kubernetes schedules Pods (not bare containers) because co-located containers (an app plus a sidecar) need to share that context, and higher-level objects (Deployment) need a stable unit to manage as a whole.
3. *Deployment vs ReplicaSet vs Pod — how do they relate?* A Deployment owns a ReplicaSet, which owns Pods. The Deployment adds rolling-update/rollback behavior on top of the ReplicaSet's job of simply keeping N pods matching a template running.
4. *ClusterIP vs NodePort vs LoadBalancer?* ClusterIP is internal-only (the default, for service-to-service traffic); NodePort opens a fixed port on every node (mostly for quick testing/bare metal); LoadBalancer provisions an external cloud load balancer, the standard way to expose a service publicly on a managed cluster.
5. *Liveness vs readiness probe?* Liveness failing restarts the container ("I'm stuck, kill me"); readiness failing removes it from Service traffic without restarting ("I'm not ready yet, don't send requests"). Follow-up: why pointing liveness at a slow dependency is dangerous (cascading restarts).

**Senior:**

6. *Explain the reconciliation/control-loop model and why it makes Kubernetes self-healing.* Every controller continuously observes actual state, diffs it against desired state stored in etcd, and acts to close the gap — nobody manually notices and fixes a crashed pod because the ReplicaSet controller's loop is always checking replica count against reality. Strong answers mention idempotency (a controller must be safely re-runnable) and eventual consistency (there's always a small reconciliation window).
7. *Walk through exactly what happens from kubectl apply to a running pod.* API server validates/persists to etcd → Deployment controller creates a ReplicaSet → ReplicaSet controller creates Pod objects → scheduler filters/scores nodes and binds a pod → kubelet on that node pulls the image via the container runtime and starts it → readiness probe passing adds it to the Service's endpoints.
8. *Why do memory limits kill a container but CPU limits only throttle it?* CPU is compressible (the kernel can give a process less CPU time and it just runs slower); memory is not compressible in the same way — there's no "slow down" for an over-budget allocation, so the kernel/kubelet must reclaim it by killing the container (OOMKill).
9. *Design a multi-tenant cluster shared by five teams — what do you put in place?* Namespaces per team, ResourceQuotas to cap consumption, default-deny NetworkPolicies with explicit allows, least-privilege RBAC per team's ServiceAccounts (see the RBAC skill), and ideally a policy engine (OPA Gatekeeper/Kyverno) enforcing organization-wide baseline rules like mandatory resource limits and non-root containers.
10. *How would you scale an inference service whose bottleneck is GPU utilization, not CPU?* Plain CPU-based HPA won't reflect the real bottleneck; use a custom-metric HPA (via Prometheus Adapter or KEDA) scaling on GPU utilization or request-queue depth, combined with taints/tolerations or Dynamic Resource Allocation dedicating GPU nodes, and a Cluster Autoscaler node pool sized for that hardware.
11. *A rolling update is stuck partway — how do you debug it?* kubectl rollout status/history first; then describe the new ReplicaSet's pods directly (not just the Deployment summary) — a stuck rollout almost always means new pods are failing readiness, so check probes, resource availability for the new pods, and recent config changes.
12. *StatefulSet vs Deployment — when is each correct, and what would go wrong if you used the wrong one?* StatefulSet for workloads needing stable identity/storage per replica (databases, brokers, leader-election systems); Deployment for interchangeable stateless replicas. Using a Deployment for a database means losing stable network identity and per-pod storage on every reschedule; using a StatefulSet for a stateless web tier adds unnecessary ordering constraints and complexity with zero benefit.
`,

  "coding-questions": `
### 1. Simplified bin-packing scheduler (tests greedy algorithms — the scheduler's actual job)

~~~python
"""
Given nodes with available (cpu, memory) capacity and pods with (cpu, memory)
requests, assign each pod to a node that has enough remaining capacity,
mimicking the FILTER phase of the real Kubernetes scheduler. Use a
best-fit-decreasing heuristic for the SCORE phase: prefer the node that
would be left with the least leftover capacity (tightest fit), which
approximates favoring balanced utilization.
"""
from dataclasses import dataclass

@dataclass
class Node:
    name: str
    cpu: float
    memory: float

@dataclass
class Pod:
    name: str
    cpu: float
    memory: float

def schedule(nodes: list[Node], pods: list[Pod]) -> dict[str, str]:
    # Sort pods largest-first: placing big pods early avoids fragmentation
    # that would strand small nodes unable to fit anything later.
    pods_sorted = sorted(pods, key=lambda p: (p.cpu, p.memory), reverse=True)
    assignment: dict[str, str] = {}

    for pod in pods_sorted:
        candidates = [n for n in nodes if n.cpu >= pod.cpu and n.memory >= pod.memory]
        if not candidates:
            raise RuntimeError(f"0 nodes available for pod {pod.name} (Pending)")
        # Best fit: the node that would have the LEAST leftover cpu after placing this pod
        best = min(candidates, key=lambda n: n.cpu - pod.cpu)
        best.cpu -= pod.cpu
        best.memory -= pod.memory
        assignment[pod.name] = best.name

    return assignment

nodes = [Node("node-a", cpu=4, memory=16), Node("node-b", cpu=2, memory=8)]
pods = [Pod("api-1", cpu=1, memory=2), Pod("api-2", cpu=1, memory=2), Pod("worker-1", cpu=3, memory=12)]
print(schedule(nodes, pods))
~~~

Complexity: O(P log P + P * N) for P pods and N nodes (sort once, linear scan per pod). Follow-ups: add taints/tolerations as a hard filter before scoring; add anti-affinity (no two pods with the same label on one node); discuss why the real scheduler re-evaluates scores rather than mutating capacity destructively mid-batch (concurrent pods arriving simultaneously).

### 2. A minimal reconciliation loop (tests the control-loop mental model directly)

~~~python
"""
Simulate the core of a ReplicaSet controller: given a desired replica count
and a dict representing "actual" running pods, reconcile by creating or
deleting pods until actual matches desired. Must be idempotent — calling
reconcile() repeatedly with no changes must be a no-op.
"""
import itertools

_pod_id_counter = itertools.count(1)

def create_pod(actual_pods: dict[str, str], label: str) -> None:
    pod_name = f"{label}-{next(_pod_id_counter)}"
    actual_pods[pod_name] = "Running"

def delete_pod(actual_pods: dict[str, str], pod_name: str) -> None:
    del actual_pods[pod_name]

def reconcile(desired_replicas: int, actual_pods: dict[str, str], label: str) -> None:
    current = [name for name in actual_pods if name.startswith(label + "-")]
    diff = desired_replicas - len(current)

    if diff > 0:
        for _ in range(diff):
            create_pod(actual_pods, label)          # under-provisioned: scale up
    elif diff < 0:
        for name in current[: -diff]:
            delete_pod(actual_pods, name)            # over-provisioned: scale down
    # diff == 0: already in sync, do nothing — this is the idempotent no-op case

pods: dict[str, str] = {}
reconcile(desired_replicas=3, actual_pods=pods, label="api")
reconcile(desired_replicas=3, actual_pods=pods, label="api")   # no-op, proven idempotent
assert len(pods) == 3
del pods[next(iter(pods))]                                       # simulate a crash
reconcile(desired_replicas=3, actual_pods=pods, label="api")   # self-heals back to 3
assert len(pods) == 3
~~~

Complexity: O(N) per reconcile call for N current pods. Follow-ups: what happens if two reconcile calls run concurrently (real Kubernetes uses resourceVersion optimistic concurrency to detect and retry conflicting writes); how would you extend this to respect a PodDisruptionBudget when scaling down.

### 3. Token-bucket-style HPA simulator (tests understanding of scaling decisions over time)

~~~python
"""
Simulate a simplified HPA: given a stream of observed average CPU utilization
readings, decide the replica count each tick using the same formula the real
HPA uses: desiredReplicas = ceil(currentReplicas * currentUtilization / targetUtilization),
clamped to [minReplicas, maxReplicas].
"""
import math

def hpa_tick(current_replicas: int, current_utilization: float, target_utilization: float,
             min_replicas: int, max_replicas: int) -> int:
    raw = current_replicas * (current_utilization / target_utilization)
    desired = math.ceil(raw)
    return max(min_replicas, min(max_replicas, desired))

replicas = 2
readings = [85, 90, 60, 40, 95]     # observed average CPU utilization % over time
for utilization in readings:
    replicas = hpa_tick(replicas, utilization, target_utilization=70,
                         min_replicas=2, max_replicas=10)
    print(f"utilization={utilization}% -> replicas={replicas}")
~~~

Complexity: O(1) per tick. Follow-ups: why real HPAs apply stabilization windows (avoiding flapping from a single noisy reading); how a custom metric (queue depth) replaces "current_utilization" for GPU/queue-bound workloads.
`,

  "hands-on-labs": `
### Lab 1 — Your first self-healing Deployment (beginner, ~1h)
Using a local cluster (kind or minikube), write a Deployment (3 replicas) and Service for a simple web app, apply it, then kubectl delete one pod by hand and watch it get recreated within seconds. Then scale to 5 replicas with kubectl scale and back down. Deliverable: a short write-up of what you observed at each step and why. Skills exercised: Pod/Deployment/Service fundamentals, self-healing intuition.

### Lab 2 — Full stack with Ingress, ConfigMap, and Secret (intermediate, ~2h)
Deploy a small API (your own FastAPI service, or any public sample image) with a Deployment, Service, Ingress, ConfigMap, and Secret, following the worked example in Deployment. Verify: config changes via ConfigMap update + rollout restart take effect; a deliberately wrong Secret key produces a CreateContainerConfigError you can diagnose via kubectl describe. Skills exercised: the full object graph, configuration management, debugging escalation path.

### Lab 3 — Autoscaling and rolling updates under load (advanced, ~3h)
Deploy a CPU-bound test app with resource requests/limits and an HPA (min 2, max 8). Generate load (hey or a simple loop of requests) and watch kubectl get hpa react in real time. Then perform a rolling update to a new image version while load is still running, and confirm zero dropped requests using maxUnavailable: 0 and correct readiness probes. Deliverable: a graph or table of replica count over time plus a note on what would have happened with a badly configured readiness probe. Skills exercised: HPA mechanics, rolling-update safety, probe correctness under real conditions.

### Lab 4 — Multi-tenant hardening and GitOps (production, ~4h)
Create two namespaces representing two teams, each with a ResourceQuota, a default-deny NetworkPolicy plus explicit allows, and least-privilege RBAC bindings (see the RBAC skill for the manifests). Then wire ArgoCD (or Flux) to a Git repo holding your manifests, make a change via a pull request, and observe the cluster reconcile to match — then hand-edit a live object with kubectl and watch GitOps revert the drift. Skills exercised: multi-tenancy end to end, RBAC application, the GitOps operating model.
`,

  "real-projects": `
Portfolio-grade projects (each maps to skills employers screen for):

1. **A fully productionized AI inference service on Kubernetes** — package a small model-serving container (even a simple FastAPI wrapper around a lightweight model) with a Deployment, Service, Ingress, ConfigMap, Secret, resource requests/limits, correct probes, and a custom-metric HPA scaling on request queue depth rather than CPU. Demonstrates: the entire worked-example pattern from this page, plus AI-specific scaling reasoning directly relevant to AI engineering roles.

2. **A multi-tenant sample platform** — two or three simulated "teams" each with their own namespace, ResourceQuota, default-deny NetworkPolicy with explicit allows, and least-privilege RBAC (cross-reference the RBAC skill's manifests), wired to a shared Prometheus/Grafana stack showing per-namespace resource consumption. Demonstrates: multi-tenancy, security posture, and observability integration together.

3. **A GitOps deployment pipeline end to end** — a CI pipeline (GitHub Actions) that builds and scans an image, pushes it to a registry, and updates a values file in a separate manifests repo; ArgoCD or Flux watching that repo and reconciling a real (kind or cloud) cluster automatically, including a deliberate rollback demonstration. Demonstrates: the full modern deployment workflow spanning CI/CD, GitOps, and Kubernetes together.

Each project: manifests (or a Helm chart) in version control, a README with an architecture diagram, a documented rollback procedure that's actually been tested, and — where relevant — a load test showing autoscaling behavior under realistic traffic. The operational discipline around the YAML is what separates a portfolio project from a toy demo.
`,

  "case-studies": `
### Google: a decade of Borg distilled into an open standard
Kubernetes exists because Google had already learned, the expensive way, what cluster scheduling needs to get right — declarative desired state, continuous reconciliation, and a clean API boundary between components. Rather than keeping that as permanent internal advantage, Google open-sourced a clean-room reimplementation and handed governance to the CNCF. Lesson: giving away hard-won operational lessons as an open, vendor-neutral standard can create more value (an entire ecosystem, and indirectly a stronger managed-Kubernetes cloud business) than keeping them proprietary.

### Docker Swarm and Apache Mesos: losing the orchestration wars
Both were credible alternatives around 2015–2017 — Swarm for its simplicity, Mesos (with Marathon) for its scheduler flexibility at massive scale (it ran at Twitter and Airbnb, among others). Kubernetes won largely on ecosystem gravity and multi-vendor neutrality: every major cloud, and eventually Docker Inc. itself, added native Kubernetes support, while Swarm remained tied to Docker Inc.'s single-vendor roadmap. Lesson: for infrastructure-layer technology, a credible, vendor-neutral governance model (CNCF) is itself a decisive competitive advantage, independent of pure technical merit.

### Kubernetes 1.6 making RBAC the default: security as an evolving default, not a launch-day guarantee
Kubernetes shipped for its first two years with a coarser, file-based ABAC authorization mode before RBAC became the default in 1.6 (2017). Many early production clusters had to be retrofitted with proper RBAC well after they were already running real workloads. Lesson: infrastructure security defaults improve over the life of a project, and operating a long-lived cluster means periodically re-auditing whether your configuration still matches current best practice, not just what was default when you first set it up.

### The dockershim removal (Kubernetes 1.24, 2022): a multi-year deprecation done right
Kubernetes originally had built-in support for talking to the Docker Engine directly (dockershim), even as the ecosystem standardized on the Container Runtime Interface (CRI) for pluggable runtimes like containerd and CRI-O. Rather than removing it abruptly, the project announced deprecation years in advance, gave clear migration guidance, and removed it only once tooling had genuinely caught up. Lesson: for infrastructure millions of workloads depend on, a well-communicated, multi-year deprecation window is not bureaucratic overhead — it is the mechanism that makes large-scale breaking changes survivable at all (directly comparable to Python's 2-to-3 migration lesson on the Python skill page, done considerably better here).
`,

  comparisons: `
| Dimension | Kubernetes | Docker Swarm | HashiCorp Nomad | AWS ECS | Serverless (Cloud Run / Fargate / AKS-serverless) |
|-----------|-----------|---------------|------------------|---------|----------------------------------------------------|
| Learning curve | Steep | Gentle | Moderate | Gentle (on AWS) | Minimal |
| Extensibility (CRDs/operators) | Extensive, ecosystem-defining | Minimal | Moderate (plugin-based) | Limited to AWS-native integrations | Minimal — deliberately abstracted away |
| Multi-cloud portability | High — the same manifests run anywhere Kubernetes runs | Moderate | High | AWS-only | Vendor-specific |
| Stateful workload support | Strong (StatefulSet + operators) | Weak | Moderate | Weak-to-moderate | Generally poor fit |
| Operational overhead | High unless managed (EKS/AKS/GKE) | Low | Low-to-moderate | Low (fully managed) | Near zero |
| Ecosystem maturity (Helm, service mesh, GitOps, observability) | Unmatched | Sparse | Growing | AWS-native tooling only | N/A — you don't manage the layer |
| Best at | Complex, multi-service, stateful, multi-cloud workloads at real scale | Small teams wanting Docker-native simplicity | HashiCorp-stack shops (Consul/Vault already in use), mixed container+non-container workloads | AWS-committed teams wanting less operational surface than raw Kubernetes | Bursty, stateless, simple workloads where infrastructure management itself is the cost to avoid |

**How seniors choose**: reach for Kubernetes once you have enough services, enough scale variability, or enough teams that the ecosystem (Helm, GitOps, autoscaling, observability integrations) pays for its own learning curve — not by default for every project. ECS or a serverless container platform is often the right, lower-overhead choice for an AWS-committed team without Kubernetes-scale complexity. Nomad is a credible, simpler alternative especially for shops already running HashiCorp's Consul/Vault. Swarm has largely lost relevance outside small, Docker-native setups. For most AI product teams past the prototype stage, Kubernetes (usually managed — EKS/AKS/GKE) is the default because the ecosystem around it (autoscaling GPU inference, Kubeflow/KServe, service meshes) is simply more mature than any alternative's.
`,

  "related-technologies": `
- **Docker** — the container runtime and image-building layer Kubernetes orchestrates; a hard prerequisite, covered on this platform's **Docker** skill.
- **Helm** — the de facto package manager and templating layer for Kubernetes applications (see Intermediate Concepts).
- **Kustomize** — built into kubectl, an alternative/complement to Helm for overlay-based environment configuration without full templating.
- **ArgoCD / Flux** — the two dominant GitOps controllers, continuously reconciling a live cluster to match a Git repository's declared state (see Production Usage).
- **Prometheus** and **Grafana** — the standard metrics-and-dashboards observability stack for a Kubernetes cluster (see those platform skills).
- **OpenTelemetry** — vendor-neutral tracing/metrics instrumentation, commonly auto-instrumenting services running on Kubernetes.
- **Istio / Linkerd (service mesh)** — add mTLS, fine-grained traffic shaping, and deep per-service observability on top of core Kubernetes networking, for teams that need more than Ingress and Deployment strategies alone provide.
- **Terraform** — infrastructure-as-code for provisioning the cluster itself (VPC, node pools, managed control plane) and often the Kubernetes objects too, via its Kubernetes provider (see the **Terraform** skill).
- **RBAC** — Kubernetes' native authorization model; this page intentionally defers the Role/ClusterRole/RoleBinding depth to the **RBAC** skill.
- **AWS / Azure / GCP** — each offers a managed Kubernetes control plane (EKS/AKS/GKE); see those skills for the cloud-specific integration points (IAM, load balancers, storage classes).
- **Kubeflow / KServe** — ML-specific platforms built as Kubernetes CRDs/operators for training pipelines and model serving, directly relevant once you're deploying AI workloads at scale.

On this platform, the natural next pages after this one: **Helm-adjacent GitOps concepts** (covered here in Production Usage) → **Terraform** (provision the cluster as code) → **Prometheus/Grafana** (observe what you deployed) → **CI/CD** and **GitHub Actions**/**Jenkins** (automate the path from commit to running pod).
`,

  "latest-updates": `
Verified against my knowledge through early-to-mid 2025 — check kubernetes.io/docs and the release notes for anything newer, since Kubernetes ships a new minor version roughly every four months.

- **Gateway API** has continued maturing as the more expressive, role-oriented successor to Ingress (separating infrastructure-provider, cluster-operator, and application-developer concerns into distinct resource types) — most production clusters in 2026 still run Ingress day-to-day, but Gateway API adoption is a genuine, growing trend worth tracking rather than dismissing as speculative.
- **In-place Pod resource resizing** (updating CPU/memory requests/limits on a running pod without recreating it) progressed from alpha toward broader stability across recent releases — historically any resource change required a full pod recreation; this closes a real operational gap, especially valuable for right-sizing without a disruptive restart.
- **Dynamic Resource Allocation (DRA)** — a more expressive API than the older extended-resource counting model for GPUs and other specialized hardware — has been actively maturing, directly relevant to AI/ML infrastructure that needs richer accelerator scheduling (fractional GPUs, specific GPU topologies) than simple integer counting allowed.
- **Sidecar containers as a native, first-class concept** (rather than an unofficial convention) landed as a formal feature, giving sidecars proper startup/shutdown ordering relative to the main container — relevant to service-mesh proxies and logging sidecars that previously had ordering race conditions.
- **The dockershim removal (Kubernetes 1.24, 2022)** is now old news but its consequence — pure CRI runtimes (containerd, CRI-O) only — is the durable baseline every current cluster runs on.
- **Ecosystem-wide**: GitOps (ArgoCD/Flux) adoption has continued to broaden as the default production deployment pattern rather than a niche practice; KEDA (event/queue-driven autoscaling) has become a common complement to the built-in HPA specifically for AI/inference workloads scaling on queue depth rather than CPU.

Given the pace of Kubernetes releases, treat any specific version number or "currently in beta/stable" claim in this section as a snapshot — verify against the current kubernetes.io release notes before quoting a version number in an interview or a production decision.
`,

  "future-roadmap": `
Where Kubernetes is heading, and what's worth betting career time on:

1. **Gateway API gradually displacing Ingress** as the expressive, extensible standard for HTTP(S) routing — worth learning once you're comfortable with Ingress, since it's the direction the ecosystem is moving, even though Ingress remains dominant in production today.
2. **Richer, more granular resource management for heterogeneous hardware.** Dynamic Resource Allocation maturing further, plus in-place resizing becoming fully stable, both point toward Kubernetes treating GPUs and other accelerators as first-class scheduling citizens rather than a bolted-on extended-resource count — directly relevant to AI infrastructure's growing share of total Kubernetes workloads.
3. **GitOps as the assumed default**, not an advanced practice — expect tooling and managed-cluster onboarding flows to increasingly assume ArgoCD/Flux-style reconciliation from Git as the standard deployment model rather than an opt-in maturity step.
4. **Platform engineering on top of Kubernetes.** Rather than every product engineer writing raw YAML, internal developer platforms (thin, opinionated layers over Kubernetes, often using CRDs) are becoming the standard interface at larger organizations — understanding core Kubernetes remains the foundation these platforms are built on, even as fewer engineers interact with raw manifests directly.
5. **AI/ML-native workload patterns maturing further**: KServe, Kubeflow, and similar operators continuing to formalize model-serving and training-pipeline patterns as Kubernetes-native CRDs, rather than every AI team hand-rolling Deployments and HPAs from scratch.

For your career: core reconciliation-loop understanding, RBAC/security fundamentals, and Helm/GitOps fluency remain durable regardless of which specific tool wins any given ecosystem debate — that foundation is what separates "can write a Deployment YAML" from "can operate a production cluster."
`,

  "cheat-sheet": `
~~~yaml
# --- Pod (rarely created directly) ---
apiVersion: v1
kind: Pod
metadata: { name: my-pod, labels: { app: my-app } }
spec:
  containers:
    - name: app
      image: myorg/app:1.0
      ports: [{ containerPort: 8000 }]

# --- Deployment (the everyday workload object) ---
apiVersion: apps/v1
kind: Deployment
metadata: { name: my-deploy }
spec:
  replicas: 3
  selector: { matchLabels: { app: my-app } }
  strategy: { rollingUpdate: { maxUnavailable: 0, maxSurge: 1 } }
  template:
    metadata: { labels: { app: my-app } }
    spec:
      containers:
        - name: app
          image: myorg/app:1.0
          resources:
            requests: { cpu: "250m", memory: "256Mi" }
            limits: { cpu: "500m", memory: "512Mi" }
          livenessProbe: { httpGet: { path: /healthz, port: 8000 } }
          readinessProbe: { httpGet: { path: /readyz, port: 8000 } }

# --- Service types ---
# ClusterIP (default, internal) / NodePort (fixed node port) / LoadBalancer (cloud LB)
apiVersion: v1
kind: Service
metadata: { name: my-svc }
spec:
  type: ClusterIP
  selector: { app: my-app }
  ports: [{ port: 80, targetPort: 8000 }]

# --- kubectl essentials ---
# kubectl apply -f file.yaml / kubectl delete -f file.yaml
# kubectl get pods -o wide / kubectl describe pod <name>
# kubectl logs <pod> [--previous] / kubectl exec -it <pod> -- sh
# kubectl scale deployment/my-deploy --replicas=5
# kubectl rollout status|history|undo deployment/my-deploy
# kubectl top nodes|pods (needs metrics-server)
~~~
`,

  "flash-cards": `
| Front | Back |
|-------|------|
| What is the smallest deployable unit in Kubernetes? | The Pod — one or more containers sharing network and storage namespaces |
| What does a Deployment add on top of a ReplicaSet? | Rolling-update and rollback behavior; the ReplicaSet's own job is just keeping N pods matching a template |
| Liveness vs readiness probe | Liveness failing restarts the container; readiness failing removes it from Service traffic without restarting |
| What is the reconciliation loop? | Observe actual state, diff against desired state in etcd, act to close the gap — run continuously by every controller |
| Which component is the ONLY thing that talks directly to etcd? | The API server |
| CPU limit vs memory limit consequence | CPU limit throttles (compressible); memory limit kills the container (OOMKilled) — not compressible |
| StatefulSet vs Deployment | StatefulSet gives stable per-replica identity and storage (databases, brokers); Deployment pods are fully interchangeable |
| ClusterIP vs NodePort vs LoadBalancer | Internal-only vs fixed port on every node vs cloud-provisioned external load balancer |
| What does a NetworkPolicy do by default with none defined? | Nothing is restricted — every pod can reach every other pod cluster-wide |
| What does Helm add over raw manifests? | Templating and parameterization (values.yaml) so one chart deploys correctly across dev/staging/prod |
| What is GitOps? | A Git repo is the source of truth for desired cluster state; a controller (ArgoCD/Flux) continuously reconciles the live cluster to match it |
| What causes a CrashLoopBackOff? | The container starts and exits repeatedly — check kubectl logs --previous for the actual crash reason |
| What does a PodDisruptionBudget protect against? | Voluntary disruptions (node drains, autoscaler scale-downs) taking too many replicas offline at once |
| Filter vs score phase of scheduling | Filter finds nodes that CAN run the pod (capacity, taints); score ranks the filtered nodes to pick the best fit |
| Where is Kubernetes' Role/RoleBinding model covered in depth on this platform? | The RBAC skill — this page intentionally focuses on broader orchestration, not RBAC internals |
`,

  mcqs: `
**1. A Deployment has replicas: 3. You delete one pod by hand. What happens?**

A) Nothing, you now have 2 pods  B) The ReplicaSet controller creates a replacement within seconds  C) The Deployment is marked failed  D) Kubernetes waits for the next kubectl apply

**Answer: B** — the ReplicaSet controller's reconciliation loop continuously checks actual vs desired replica count and creates a replacement immediately; this is exactly the self-healing property.

**2. Which statement about liveness and readiness probes is correct?**

A) They do the same thing  B) A failed liveness probe removes the pod from Service traffic without restarting it  C) A failed readiness probe restarts the container  D) A failed liveness probe causes the kubelet to restart the container

**Answer: D** — liveness failure means "restart me"; readiness failure means "don't route traffic to me yet," which is B's description reversed.

**3. A container has no memory limit set and starts leaking memory. What's the most likely outcome?**

A) It is automatically throttled like CPU  B) It can consume node memory unboundedly, potentially affecting other pods on the node  C) Kubernetes automatically restarts it before it becomes a problem  D) The scheduler prevents this at deploy time

**Answer: B** — with no memory limit, there's no ceiling the kubelet enforces; this is exactly why Best Practices insists on always setting limits.

**4. Which component is the single source of truth for all cluster state?**

A) The scheduler  B) kubelet  C) etcd  D) kube-proxy

**Answer: C** — etcd durably stores all cluster state; the API server is the only component that reads/writes it directly.

**5. Why does a StatefulSet exist when a Deployment already provides replicas?**

A) StatefulSets are faster to schedule  B) StatefulSets give stable, ordered network identity and per-replica persistent storage that follows each pod across rescheduling  C) StatefulSets don't support rolling updates  D) There's no real difference

**Answer: B** — Deployment pods are fully interchangeable; StatefulSet pods have stable names (pod-0, pod-1) and each keeps its own PersistentVolumeClaim, which databases and brokers require.

**6. What does a default-deny NetworkPolicy with no other rules accomplish?**

A) Nothing changes  B) Blocks all ingress traffic to matched pods until explicit allow rules are added  C) Blocks all traffic cluster-wide including control-plane traffic  D) Only affects traffic leaving the cluster

**Answer: B** — it establishes a deny-by-default posture for the selected pods' ingress traffic, requiring explicit allow rules for legitimate traffic paths, exactly the multi-tenancy best practice described in Advanced Concepts and Security.
`,

  "revision-notes": `
**Core model in a few lines:** Kubernetes orchestrates containers across a fleet of machines by having you declare desired state (replicas, resources, networking) and continuously reconciling actual state to match it. Pod is the smallest unit; Deployment/ReplicaSet keep N pods running; Service gives pods a stable address; Ingress routes HTTP(S) at the edge; ConfigMap/Secret externalize configuration; Namespace partitions a cluster logically; StatefulSet and DaemonSet handle the two workload shapes (stable identity, one-per-node) a Deployment can't.

**Control plane vs nodes:** API server is the single front door, validating and persisting everything to etcd, the cluster's source of truth. Scheduler assigns unscheduled pods to nodes via filter-then-score. Controller manager runs the built-in reconciliation loops. On each worker node, kubelet starts/stops/restarts containers via the container runtime and runs probes; kube-proxy programs Service load-balancing rules.

**The one idea that explains everything else:** the reconciliation/control loop — observe, diff, act, repeat, run independently by every controller, always idempotent, always eventually consistent. Self-healing, rolling updates, and autoscaling are all just this same loop applied to different objects.

**Production reality:** always set resource requests/limits; distinct liveness/readiness probes; never latest tags; handle SIGTERM for safe rolling updates; namespaces plus ResourceQuota plus default-deny NetworkPolicy plus least-privilege RBAC (see the RBAC skill) for real multi-tenancy; Helm for templating; GitOps (ArgoCD/Flux) as the deployment workflow; Prometheus/Grafana for observability; Terraform for provisioning the cluster itself.

**Interview reflexes:** explain the reconciliation loop unprompted; know why memory limits kill but CPU limits throttle; distinguish liveness from readiness precisely; trace kubectl apply through the API server, scheduler, and kubelet to a running pod; reason about StatefulSet vs Deployment and about multi-tenant hardening as a layered problem, not a single setting.
`,

  "learning-roadmap": `
A realistic path to production-ready Kubernetes competence (assumes the Docker skill is already solid):

**Week 1 — Core objects.** Beginner Concepts + Lab 1. Build intuition for Pod/Deployment/Service/Namespace on a local kind or minikube cluster. Milestone: delete a pod by hand and watch it self-heal, and explain why in your own words.

**Week 2 — The full object graph.** Intermediate Concepts + Lab 2. Ingress, ConfigMap, Secret, StatefulSet, DaemonSet, probes, Helm basics. Milestone: deploy the worked FastAPI example from Deployment end to end on your own cluster.

**Week 3 — Internals and architecture.** Internal Working, Architecture, Data Flow sections. Read them until you can draw the control-plane/worker-node diagram and the kubectl-apply-to-running-pod sequence from memory, unprompted.

**Week 4 — Scaling and resilience.** Advanced Concepts, Performance, Scalability + Lab 3. HPA, resource requests/limits tuning, affinity/anti-affinity, PodDisruptionBudget. Milestone: run a load test against your own HPA-backed Deployment and explain the replica-count graph.

**Week 5 — Security and multi-tenancy.** Security section here, plus the RBAC skill's Kubernetes-specific manifests + Lab 4. NetworkPolicy, ResourceQuota, least-privilege RBAC together. Milestone: build the two-namespace multi-tenant lab and demonstrate isolation actually holds.

**Week 6 — Production operations.** Production Usage, Deployment, Debugging, Monitoring, Production Checklist. Wire up GitOps (ArgoCD or Flux) against a real repo. Milestone: make a change via pull request and watch it reconcile automatically; then intentionally break a rollout and practice the debugging escalation path and a rollback.

Then continue to the **Terraform** skill on this platform — provisioning the cluster itself as code is the natural next layer once you can operate what runs on top of it, followed by **Prometheus** and **Grafana** for deeper observability.
`,

  "official-docs": `
- [Kubernetes documentation](https://kubernetes.io/docs/home/) — the reference; the Concepts and Tasks sections are both genuinely well-written and worth reading in full once.
- [Kubernetes API reference](https://kubernetes.io/docs/reference/kubernetes-api/) — the precise schema for every object kind; essential once you're writing non-trivial manifests.
- [Kubernetes release notes / CHANGELOG](https://github.com/kubernetes/kubernetes/tree/master/CHANGELOG) — verify any specific version claim here before relying on it.
- [Helm documentation](https://helm.sh/docs/) — chart authoring, templating functions, and repository management.
- [ArgoCD documentation](https://argo-cd.readthedocs.io/) and [Flux documentation](https://fluxcd.io/flux/) — the two dominant GitOps controllers.
- [CNCF landscape](https://landscape.cncf.io/) — a map of the surrounding ecosystem (service mesh, observability, policy engines) so you know what exists before reaching for a specific tool.
- [Gateway API documentation](https://gateway-api.sigs.k8s.io/) — the emerging Ingress successor covered in Latest Updates and Future Roadmap.
`,

  books: `
- **Kubernetes: Up and Running, 3rd ed.** — Hightower, Burns, Beda (two of Kubernetes' original creators). The best first book — clear, practical, and written by the people who designed the system.
- **Kubernetes in Action, 2nd ed.** — Marko Lukša. The most thorough single volume; excellent for genuinely understanding internals, not just copying manifests.
- **Kubernetes Patterns, 2nd ed.** — Ibryam and Huß. Catalogs the recurring design patterns (sidecar, operator, init container, and more) once you're past the basics.
- **Production Kubernetes** — Rosso, Lander, Brandt, Harris. The operational, real-world-incidents perspective — closest in spirit to this page's Production and Security sections.
- **Cloud Native DevOps with Kubernetes, 2nd ed.** — Arundel and Domingus. Strong on the CI/CD and GitOps workflow around a cluster, not just the cluster itself.
- **The Kubernetes Book** — Nigel Poulton. A concise, frequently updated introduction, good for a fast first pass before going deeper with the above.
`,

  blogs: `
- **The official Kubernetes blog** (kubernetes.io/blog) — release announcements and deep-dive feature explainers straight from SIG contributors.
- **Learnk8s** (learnk8s.io/blog) — consistently excellent, practically minded deep dives on specific mechanisms (scheduling, networking, autoscaling).
- **CNCF blog** (cncf.io/blog) — ecosystem-wide news across the surrounding projects (Prometheus, Helm, service meshes).
- **Last Week in Kubernetes Development** (lastweekin.dev) — the highest-signal way to track what's actually shipping release to release without reading every PR yourself.
- **Kelsey Hightower's writing and talks** — an original, widely respected voice on Kubernetes operational philosophy, especially the "Kubernetes the Hard Way" material for internals understanding.
- **Cloud provider engineering blogs (AWS/Azure/GCP)** — regularly publish real production war stories about running managed Kubernetes at scale; complement the AWS/Azure/GCP skills directly.
`,

  "research-papers": `
Kubernetes has an unusually strong, directly-applicable research lineage — read these in order:

- **"Large-scale cluster management at Google with Borg"** (Verma et al., EuroSys 2015) — the foundational systems paper describing the internal system Kubernetes is a clean-room reimplementation of. The single most important paper for genuinely understanding why Kubernetes is shaped the way it is.
- **"Omega: flexible, scalable schedulers for large compute clusters"** (Schwarzkopf et al., EuroSys 2013) — Google's research into shared-state, optimistic-concurrency scheduling that influenced Kubernetes' own API-server-mediated, resourceVersion-based concurrency model.
- **"Borg, Omega, and Kubernetes"** (Burns, Grant, Oppenheimer, Brewer, Wilkes; ACM Queue / CACM, 2016) — written by Kubernetes' own creators, explicitly connecting the lineage and explaining design decisions Kubernetes made differently from Borg and why.
- **"Kubernetes as an Availability Manager"**-style operational literature and the numerous CNCF-affiliated case-study papers on autoscaling and multi-tenancy are worth reading once you've internalized the three papers above, though they are less foundational than genuinely essential.

For AI engineers specifically: papers on GPU scheduling and cluster resource management for ML workloads (search for recent MLSys/OSDI/NSDI work on heterogeneous accelerator scheduling) are the closest analog to a "Kubernetes for AI" research thread, extending the same bin-packing and reconciliation ideas to accelerator-aware placement.
`,

  videos: `
- **Kelsey Hightower — numerous KubeCon keynotes and "Kubernetes the Hard Way"** — the clearest explanations of Kubernetes' philosophy and internals from one of its most respected practitioners.
- **Joe Beda, Brendan Burns, Craig McLuckie — early Kubernetes talks and interviews** — the creators explaining the original design intent directly, useful for understanding decisions that aren't obvious from the docs alone.
- **KubeCon + CloudNativeCon keynotes and breakout sessions** — the single best way to see how real companies (many featured in Industry Examples) actually operate Kubernetes at scale, updated every conference cycle.
- **TGI Kubernetes (Google Cloud's recurring livestream series)** — deep, hands-on dives into specific mechanisms, often featuring maintainers.
- **"Deep dive into the Kubernetes scheduler" talks (various KubeCon years)** — for genuinely understanding the filter/score algorithm beyond the simplified model in this page's Advanced Concepts and coding questions.
`,

  "github-repos": `
- [kubernetes/kubernetes](https://github.com/kubernetes/kubernetes) — the source; the cmd/kube-scheduler and pkg/controller directories are the best places to see the reconciliation loop pattern in real code.
- [kubernetes/kubectl](https://github.com/kubernetes/kubectl) and [kubernetes-sigs/kind](https://github.com/kubernetes-sigs/kind) — the everyday CLI and the fast local-cluster tool used throughout this page's labs.
- [helm/helm](https://github.com/helm/helm) — the package manager; read the chart template engine to understand exactly how values.yaml flows into rendered manifests.
- [argoproj/argo-cd](https://github.com/argoproj/argo-cd) and [fluxcd/flux2](https://github.com/fluxcd/flux2) — the two dominant GitOps controllers referenced throughout Production Usage.
- [prometheus/prometheus](https://github.com/prometheus/prometheus) and [kubernetes/kube-state-metrics](https://github.com/kubernetes/kube-state-metrics) — the observability stack this page's Monitoring section builds on.
- [open-policy-agent/gatekeeper](https://github.com/open-policy-agent/gatekeeper) — policy enforcement referenced in Advanced Concepts and Security.
- [kubernetes/autoscaler](https://github.com/kubernetes/autoscaler) — the Cluster Autoscaler and Vertical Pod Autoscaler implementations referenced in Scalability.
- [kserve/kserve](https://github.com/kserve/kserve) and [kubeflow/kubeflow](https://github.com/kubeflow/kubeflow) — the AI/ML-specific operator ecosystem built on top of core Kubernetes.
- [kubernetes-sigs/gateway-api](https://github.com/kubernetes-sigs/gateway-api) — the emerging Ingress successor covered in Latest Updates.
`,

  "practice-problems": `
**Ordered by skill focus:**

1. *Core objects fluency*: from a blank cluster, write and apply a Deployment, Service, and ConfigMap from memory (no copy-paste) for a simple web app; verify with kubectl describe and kubectl logs.
2. *Probes*: intentionally misconfigure a liveness probe to point at a slow dependency, observe the restart storm, then fix it by splitting liveness and readiness correctly — reproduce the Anti-Patterns section yourself.
3. *Scheduling*: taint a node, deploy a pod with no matching toleration, and diagnose the resulting Pending status using only kubectl describe's Events section (no external help).
4. *Scaling*: configure an HPA on a CPU-bound sample app, generate load, and predict the resulting replica count by hand using the formula from the coding-questions HPA simulator before checking kubectl get hpa.
5. *StatefulSet*: deploy a 3-replica StatefulSet, kill pod-1 specifically, and confirm it comes back as pod-1 with the same PersistentVolumeClaim, not a renumbered replacement.
6. *Multi-tenancy*: build the two-namespace ResourceQuota/NetworkPolicy/RBAC lab from Hands-on Labs and then deliberately try to violate isolation from one namespace to the other, confirming it's actually blocked.
7. *GitOps*: wire ArgoCD or Flux to a repo, make three sequential changes via pull requests, and practice reading the sync/diff view to understand exactly what changed between each reconciliation.
8. *Debugging under pressure*: have a colleague (or your own past self, a week later) intentionally break a manifest (wrong image tag, missing ConfigMap key, bad resource request) and time how fast you can diagnose it using only the escalation path from Debugging.

External sets: KillerCoda's free interactive Kubernetes scenarios, KodeKloud's Kubernetes labs, and the official CKAD (Certified Kubernetes Application Developer) and CKA (Certified Kubernetes Administrator) exam curricula — both are excellent, well-structured practice paths even if you never sit the exam.
`,

  "architecture-diagram": `
The reference production architecture this page builds toward — the shape a real AI-serving platform on Kubernetes takes:

~~~mermaid
flowchart TB
    Client["Clients (web/mobile/API consumers)"] --> DNS["DNS / CDN"]
    DNS --> ING["Ingress Controller\n(TLS termination, host/path routing)"]
    ING --> SVC1["Service: api-svc"]
    ING --> SVC2["Service: inference-svc"]
    SVC1 --> API1["API Deployment\n(FastAPI pods, HPA-managed)"]
    SVC2 --> INF1["Inference Deployment\n(GPU node pool, custom-metric HPA\non queue depth)"]
    API1 --> CFG[("ConfigMap + Secret")]
    API1 --> PG[("PostgreSQL\n(StatefulSet or managed DB service)")]
    API1 --> RD[("Redis (cache/queue)")]
    INF1 --> RD
    subgraph Platform["Platform layer"]
        HPA["HPA / VPA / Cluster Autoscaler"]
        RBAC["RBAC + NetworkPolicy + ResourceQuota\n(see the RBAC skill)"]
        GITOPS["ArgoCD/Flux\n(reconciles cluster from Git)"]
    end
    subgraph Observability
        PR["Prometheus"] --> GF["Grafana"]
        OT["OpenTelemetry traces"]
        KSM["kube-state-metrics"]
    end
    API1 -.metrics/traces.-> Observability
    INF1 -.metrics/traces.-> Observability
    GITOPS -->|reconciles| API1
    GITOPS -->|reconciles| INF1
~~~

Every box maps to a section on this page or a related platform skill (Docker, RBAC, Prometheus, Grafana, Terraform, CI/CD); this diagram is the map of how they compose into one running system.
`,

  "mind-map": `
~~~mermaid
mindmap
  root((Kubernetes))
    Core objects
      Pod
      Deployment and ReplicaSet
      Service: ClusterIP NodePort LoadBalancer
      Ingress
      ConfigMap and Secret
      Namespace
      StatefulSet
      DaemonSet
      Job and CronJob
    Control plane
      API server
      etcd
      Scheduler
      Controller manager
      Cloud controller manager
    Worker node
      kubelet
      kube-proxy
      Container runtime
    Core internal concept
      Reconciliation control loop
      Desired vs actual state
      Idempotency and eventual consistency
    Scaling and scheduling
      Requests and limits
      HPA VPA Cluster Autoscaler
      Affinity and anti-affinity
      Taints and tolerations
      Dynamic Resource Allocation
    Production
      Probes: liveness readiness startup
      Rolling updates and rollbacks
      Helm
      GitOps: ArgoCD Flux
      Terraform provisioning
    Security and multi-tenancy
      RBAC (see RBAC skill)
      NetworkPolicy
      ResourceQuota
      Pod Security Admission
    Observability
      Prometheus and Grafana
      kube-state-metrics
      OpenTelemetry
    Ecosystem
      Docker (prerequisite)
      Service mesh: Istio Linkerd
      Kubeflow and KServe
      Managed: EKS AKS GKE
~~~
`,
};

export default kubernetes;
