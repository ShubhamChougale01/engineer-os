import type { SkillContent } from "../types";

/**
 * Docker — full 50-section knowledge page.
 * Note: code blocks use ~~~ fences (CommonMark-equivalent to backtick fences)
 * so this file needs no backtick escaping inside the template literals.
 */
const docker: SkillContent = {
  overview: `
Docker is the tool that made **containers** a mainstream unit of software packaging and deployment. A container bundles an application together with everything it needs to run — code, runtime, system libraries, configuration — into a single, portable image that behaves identically on a laptop, a CI runner, and a production cluster. Docker did not invent containers (Linux had the underlying primitives for years), but it made them usable: one file format (the Dockerfile), one build command, one distribution mechanism (registries), and one run command.

For an AI engineer, Docker is not optional infrastructure trivia — it is how you ship almost everything you build. Your FastAPI inference service, your model-serving endpoint, your batch embedding job, your Jupyter environment for reproducible experiments, your evaluation harness — all of these travel as container images in any team past the "one laptop" stage. Every cloud provider's compute product (AWS ECS/EKS, Azure AKS, Google Cloud Run/GKE) and every CI/CD pipeline (see the CI/CD and GitHub Actions skills) assumes you can produce a Docker image. Kubernetes (see the Kubernetes skill) is, at its core, a system for scheduling containers built by Docker (or a Docker-compatible tool) across a fleet of machines.

Key characteristics: containers are **isolated processes on a shared host kernel**, not full virtual machines — they start in milliseconds, not minutes, and pack far more workload density onto the same hardware. Images are **immutable, layered, and content-addressed**, which makes builds cacheable and distribution efficient. Docker is also an ecosystem: the Docker Engine (daemon), the Docker CLI, Docker Compose (for local multi-service development), Docker Hub and other registries (for distribution), and the Open Container Initiative (OCI) standards that make the format portable across runtimes (containerd, Podman, CRI-O).

Docker's real value is a promise: "it works on my machine" becomes "it works, period" — because the machine travels with the code.
`,

  history: `
Docker was created by **Solomon Hykes** and his team at a company called dotCloud (a Platform-as-a-Service startup) and was open-sourced in **March 2013**. The underlying Linux kernel features Docker packaged — namespaces and cgroups — had existed for years; Docker's innovation was the developer experience layered on top: a simple CLI, a declarative build file, and a way to share images.

| Year | Milestone |
|------|-----------|
| 1979 | Unix chroot introduces filesystem isolation — the conceptual ancestor |
| 2000s | FreeBSD Jails, Solaris Zones extend OS-level isolation |
| 2006–2008 | Google contributes cgroups to the Linux kernel; Linux namespaces mature |
| 2008 | LXC (Linux Containers) ships — direct use of namespaces + cgroups, but low-level and hard to use |
| 2013 | dotCloud open-sources **Docker**, rebrands the company to Docker, Inc. |
| 2014 | Docker drops LXC as its default execution driver, builds its own libcontainer |
| 2014 | Docker Compose (originally "Fig") is acquired and integrated |
| 2015 | **Open Container Initiative (OCI)** founded — Docker donates its image/runtime spec to standardize the format across vendors |
| 2016 | Docker Swarm (native orchestration) ships; Kubernetes is already winning the orchestration war |
| 2017 | Docker Engine split into open-source **Moby Project** and the commercial Docker product; **containerd** spun out as an independent, CNCF-hosted runtime |
| 2019 | Docker, Inc. sells its enterprise business to Mirantis; refocuses on developer tooling |
| 2020 | Kubernetes deprecates "dockershim" (direct Docker support), standardizing on CRI + containerd — Docker-built images are unaffected since they're OCI-compliant |
| 2021 | Docker Desktop introduces licensing fees for large companies, accelerating interest in alternatives (Podman, Rancher Desktop, colima) |
| 2023+ | Docker Build Cloud, multi-arch buildx maturity, and continued focus on developer inner-loop speed |

The lesson worth internalizing: Docker's technical primitives (namespaces, cgroups) were not new. Its contribution was standardization and usability — proof that a great interface over existing kernel features can create an entire industry (the same way Git didn't invent version control, but made it universal).
`,

  "why-it-exists": `
Before Docker, shipping software reliably had two dominant, both-flawed approaches:

- **"Works on my machine" deployment**: you handed ops a list of dependencies (a specific Python version, specific system libraries, specific config files) and hoped the production machine matched. It rarely did. Differences in OS patch level, library versions, or environment variables caused a long tail of "it worked in staging" incidents.
- **Full virtual machines per application**: to guarantee isolation, teams ran one whole guest OS (with its own kernel, its own memory footprint of hundreds of MB to GBs) per application, even for small services. VMs booted in minutes, wasted enormous resources on duplicate OS kernels, and made "one app per box" prohibitively expensive at scale.

Configuration management tools (Chef, Puppet, Ansible) tried to close the gap by scripting environment setup deterministically, but they configured long-lived, mutable servers — drift crept back in over time as manual patches and one-off fixes accumulated.

Docker's gap-filling idea: package the **application plus its exact runtime environment** as one immutable artifact (the image), and run it as an **isolated process** (the container) that shares the host's kernel instead of booting a new one. You get VM-like isolation of dependencies with process-like startup speed and density. The image is built once and is bit-for-bit the same everywhere it runs — the environment is no longer configured on the target machine, it is shipped with the code.
`,

  "problem-it-solves": `
Concrete pains Docker removes:

- **Environment drift**: "it needs Python 3.11.4 with these exact system packages" is now baked into the image, not documented in a wiki page that goes stale.
- **Dependency conflicts between apps on the same host**: two services needing different versions of the same library no longer fight over one shared machine — each container has its own filesystem view.
- **Slow, heavy isolation**: containers start in milliseconds and use megabytes of overhead, versus minutes and gigabytes for a VM, enabling far higher density and faster CI pipelines, faster autoscaling, and faster local dev loops.
- **Painful onboarding**: a new engineer runs one command (docker compose up) instead of a multi-page setup document for Postgres, Redis, and service versions.
- **Fragile "snowflake" production servers**: because the image is immutable and rebuilt from a Dockerfile, there is no manual SSH-and-patch drift — you rebuild and redeploy instead of hand-editing a running box.

What Docker deliberately does **NOT** solve:

- **Orchestration across many machines**: scheduling, healing, scaling, and networking containers across a fleet is Kubernetes's job (or ECS/Swarm), not Docker's. Docker runs containers on one host; see the Kubernetes skill for the multi-host story.
- **Strong security isolation equivalent to a VM**: containers share the host kernel, so a kernel-level exploit can, in principle, cross container boundaries. Docker reduces attack surface with defaults (namespaces, cgroups, seccomp, capabilities) but does not provide hypervisor-grade isolation — see Security below and technologies like gVisor/Kata Containers for hardened boundaries.
- **Application-level concerns**: Docker does not make your code correct, does not replace testing, and does not manage application state — persistent data still needs deliberate handling (see Volumes in Intermediate Concepts).
- **Configuration/secrets management**: Docker can inject environment variables, but it is not a secrets vault — see the Secrets Management skill for how credentials should actually reach a running container.
`,

  "learning-objectives": `
By the end of this page you should be able to:

1. Explain precisely how a container differs from a virtual machine, in terms of namespaces, cgroups, and the union filesystem — and answer this in an interview without hand-waving.
2. Write a production-quality Dockerfile using the correct instructions (FROM, RUN, COPY, WORKDIR, ENV, EXPOSE, CMD, ENTRYPOINT, USER) and explain what each line does to the image.
3. Order Dockerfile instructions to maximize layer-cache reuse and measurably speed up rebuilds.
4. Design a multi-stage build that produces a minimal, secure production image from a larger build environment.
5. Tag and version images correctly for production (and explain why the "latest" tag is dangerous there).
6. Write a docker-compose.yml that runs a multi-service local stack (an app, a database, a cache) with correct networking and persistent volumes.
7. Choose the right Docker network mode and the right persistence mechanism (volume vs bind mount) for a given scenario.
8. Apply container security fundamentals: non-root users, minimal base images, image scanning, and secret handling.
9. Set memory/CPU resource limits and container health checks appropriate for production.
10. Debug a failing or misbehaving container using the standard escalation path of Docker CLI tools.
`,

  prerequisites: `
- **Required**: comfort with a command-line shell (cd, ls, environment variables, exit codes) and basic Linux literacy (processes, files, permissions). See the **Linux** skill if any of this is new.
- **Required**: enough familiarity with at least one application (a script, a small web service) that you have something real to containerize. The **Python** skill's FastAPI example is used as the running example on this page.
- **Helpful, not required**: basic networking concepts (ports, localhost, DNS) — covered again here where Docker-specific.
- **For later sections**: passing familiarity with YAML syntax (used heavily by docker-compose.yml) and with the idea of a package registry (npm, PyPI) transfers directly to Docker's registry concept.

Dependency links on this platform: **Linux** → this page → **Kubernetes** (orchestrating many containers), **CI/CD** and **GitHub Actions** (building and pushing images in a pipeline), **AWS / Azure / GCP** (where the containers actually run in production), **Terraform** (provisioning the infrastructure containers run on).
`,

  "beginner-concepts": `
### What a container actually is

A container is **an isolated Linux process**, not a mini virtual machine. Three kernel features make the isolation possible, and every one of them is worth being able to name in an interview:

1. **Namespaces** — give a process its own isolated *view* of a global resource. The PID namespace makes a container's process see itself as PID 1 even though the host sees it as PID 48213. The network namespace gives it its own network interfaces, routing table, and localhost. The mount namespace gives it its own filesystem tree. Docker uses PID, net, mount, UTS (hostname), IPC, and user namespaces to build the illusion of a private machine.
2. **cgroups (control groups)** — limit and account for *how much* of a resource (CPU, memory, disk I/O) a process (or group of processes) can consume. This is what stops one noisy container from starving its neighbors on the same host — see Resource limits later on this page.
3. **A union filesystem** (overlayfs on modern Linux) — stacks read-only image layers under a thin writable layer, so multiple containers can share the same underlying image files on disk without copying them, while each container still appears to have its own writable filesystem.

Put together: a container is a normal Linux process, launched with namespaces so it cannot see other processes/network/filesystem, constrained by cgroups so it cannot hog the host, and given a filesystem assembled from stacked image layers.

### Container vs virtual machine — the diagram that matters

~~~text
Virtual Machines                    Containers
+-------------------------+          +-------------------------+
| App A  | App B  | App C |          | App A  | App B  | App C |
| Bins/  | Bins/  | Bins/ |          | Bins/  | Bins/  | Bins/ |
| Libs   | Libs   | Libs  |          | Libs   | Libs   | Libs  |
| Guest  | Guest  | Guest |          +-------------------------+
| OS     | OS     | OS    |          |     Docker Engine       |
+-------------------------+          +-------------------------+
|       Hypervisor        |          |       Host OS Kernel    |
+-------------------------+          +-------------------------+
|        Host OS          |          |        Hardware         |
+-------------------------+          +-------------------------+
|        Hardware         |
+-------------------------+
~~~

Each VM boots its own full kernel — minutes to start, gigabytes of overhead, but strong isolation (a hypervisor-enforced hardware boundary). Each container shares the host's ONE kernel — milliseconds to start, megabytes of overhead, but isolation is enforced in software by that shared kernel (namespaces/cgroups), which is a weaker security boundary. This distinction is the single most frequently tested Docker interview question — see Interview Questions.

### Images vs containers

An **image** is an immutable, read-only template: a stack of filesystem layers plus metadata (what command to run, what user, what ports). A **container** is a running (or stopped) instance of an image, with one thin writable layer added on top for any runtime changes. The relationship mirrors a class and an object: one image, many containers.

~~~bash
docker pull python:3.12-slim         # download an image from a registry
docker images                        # list images on this machine
docker run python:3.12-slim echo hi  # create + start a CONTAINER from the image
docker ps -a                         # list containers (running and stopped)
docker rm <container-id>             # remove a stopped container
docker rmi python:3.12-slim          # remove the image
~~~

### Your first Dockerfile

~~~dockerfile
FROM python:3.12-slim
WORKDIR /app
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt
COPY . .
EXPOSE 8000
CMD ["python", "app.py"]
~~~

~~~bash
docker build -t myapp:1.0 .          # build an image, tag it myapp:1.0
docker run -p 8000:8000 myapp:1.0    # map host port 8000 to container port 8000
~~~

FROM sets the base image; WORKDIR sets the working directory for subsequent instructions; COPY brings files from your machine into the image; RUN executes a command AT BUILD TIME (installing packages); EXPOSE documents which port the app listens on; CMD is the default command run when a container STARTS. Each of these gets full treatment in Intermediate Concepts.

### Running, inspecting, and cleaning up

~~~bash
docker run -d --name web -p 8000:8000 myapp:1.0   # -d: detached (background)
docker logs -f web                                 # follow the container's stdout/stderr
docker exec -it web bash                           # open a shell INSIDE a running container
docker stop web                                     # graceful stop (SIGTERM, then SIGKILL)
docker system prune -a                              # reclaim disk: remove unused images/containers
~~~

Common beginner trap: forgetting that data written inside a container's writable layer disappears when the container is removed. If you need data to survive, you need a volume — covered in Intermediate Concepts.
`,

  "intermediate-concepts": `
### The full Dockerfile instruction set

~~~dockerfile
FROM node:20-alpine AS base       # base image; AS names this build stage
LABEL maintainer="team@example.com"
WORKDIR /app                     # sets cwd for RUN/COPY/CMD that follow
ENV NODE_ENV=production          # sets an environment variable in the image
ARG BUILD_VERSION=dev            # build-time-only variable (not in final image env)
COPY package*.json ./            # copy files from build context into the image
RUN npm ci --omit=dev            # execute a command, creates a new layer
COPY . .                         # copy the rest of the source
USER node                        # drop from root to an unprivileged user
EXPOSE 3000                      # documentation: the port this app listens on
HEALTHCHECK --interval=30s CMD node healthcheck.js || exit 1
ENTRYPOINT ["node"]              # fixed executable
CMD ["server.js"]                # default argument(s) to the entrypoint
~~~

- **FROM**: chooses the starting filesystem and metadata. Can appear multiple times for multi-stage builds (Advanced Concepts).
- **RUN**: executes a shell command at BUILD time and commits the result as a new layer — this is how you install packages, compile code, or create directories.
- **COPY**: copies files from the build context (the directory you ran docker build from) into the image. Prefer COPY over ADD unless you specifically need ADD's tar-extraction or remote-URL behavior — ADD's implicit magic surprises people.
- **WORKDIR**: sets the working directory for all following instructions AND for the container at runtime; prefer it over "RUN cd x && ...", which doesn't persist across instructions.
- **ENV**: sets an environment variable that persists into the running container — good for things like NODE_ENV or a PORT default that the app reads at runtime.
- **ARG**: a build-time-only variable, available only during "docker build" (e.g., to parameterize a version), not present in the running container unless you explicitly copy it into an ENV.
- **EXPOSE**: purely documentation and a hint to tooling — it does NOT actually publish the port. Publishing happens with "docker run -p" or a compose "ports:" entry.
- **USER**: switches the user that subsequent RUN instructions AND the final container process run as — critical for dropping root (see Security).
- **HEALTHCHECK**: tells Docker how to ask "is this container actually healthy," not just "is the process still running" (see Monitoring/Deployment).

### CMD vs ENTRYPOINT — the instruction pair everyone confuses

~~~dockerfile
# Pattern 1: CMD only — fully overridable
FROM python:3.12-slim
CMD ["python", "app.py"]
# docker run myimage                  -> runs: python app.py
# docker run myimage python other.py  -> runs: python other.py  (CMD replaced)

# Pattern 2: ENTRYPOINT + CMD — CMD becomes default ARGUMENTS to ENTRYPOINT
FROM python:3.12-slim
ENTRYPOINT ["python", "app.py"]
CMD ["--port", "8000"]
# docker run myimage                  -> runs: python app.py --port 8000
# docker run myimage --port 9000      -> runs: python app.py --port 9000 (only CMD part replaced)
~~~

Mental model: ENTRYPOINT fixes the executable; CMD supplies default arguments to it that the caller can override at "docker run" time without retyping the whole command. Use ENTRYPOINT when the image should behave like a single-purpose binary (a CLI tool); use bare CMD when the image is meant to run varied commands (a general-purpose base image). Many production images combine both, plus an ENTRYPOINT shell script that does setup (waiting for a dependency, running migrations) before "exec"-ing into CMD.

### Image layers and the caching rule that matters most

Every RUN, COPY, and ADD instruction creates a new, cached filesystem layer, stacked via the union filesystem. Docker reuses a cached layer if, and only if, the instruction AND every instruction before it are unchanged. This makes **instruction order** a real performance lever:

~~~dockerfile
# SLOW: any source change invalidates the dependency-install layer too
FROM python:3.12-slim
WORKDIR /app
COPY . .
RUN pip install --no-cache-dir -r requirements.txt
CMD ["python", "app.py"]

# FAST: dependency layer only rebuilds when requirements.txt itself changes
FROM python:3.12-slim
WORKDIR /app
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt
COPY . .
CMD ["python", "app.py"]
~~~

Rule of thumb: order instructions from **least frequently changing** to **most frequently changing**. Base image and system packages first, then dependency manifests and installs, then application source last — because source changes on every commit while dependencies change rarely.

### Volumes and bind mounts — making data survive

A container's writable layer is ephemeral: remove the container, lose the data. Two mechanisms give you persistence:

~~~bash
# Named volume — Docker manages the storage location; portable, the production default
docker volume create pgdata
docker run -d -v pgdata:/var/lib/postgresql/data postgres:16

# Bind mount — maps a specific HOST path into the container; great for local dev
docker run -d -v "$(pwd)/src:/app/src" myapp:1.0
~~~

Use **named volumes** for anything that needs to persist in production (databases, uploaded files) — Docker owns the lifecycle and it works the same on any host. Use **bind mounts** for local development, so edits on your machine appear instantly inside the running container without a rebuild (hot-reload workflows). Never bind-mount your source code into a production image — you want the immutable, tested artifact you built, not whatever happens to be on the host disk.

### Networking modes

~~~bash
docker network create mynet                 # user-defined bridge network
docker run -d --network mynet --name db postgres:16
docker run -d --network mynet --name api myapp:1.0
# On a user-defined bridge, containers resolve each other BY NAME: api can reach "db:5432"
~~~

- **bridge** (default): each container gets a private IP on a virtual bridge network; containers on the SAME user-defined bridge network can resolve each other by container name via Docker's embedded DNS. The default (unnamed) bridge network does NOT provide name resolution — always create a user-defined network.
- **host**: the container shares the host's network namespace directly — no port mapping needed, but no network isolation either, and you cannot run two containers on the same port. Used for performance-sensitive or low-level networking tools.
- **none**: the container gets no networking at all — used for pure computation tasks with no network requirement, maximizing isolation.

### Registries and image tagging

An image lives in a **registry** — Docker Hub (the public default), Amazon ECR, Google Artifact Registry/GCR, Azure Container Registry, or a self-hosted private registry (Harbor, generic OCI registry). An image reference has the shape "registry/namespace/repository:tag":

~~~bash
docker tag myapp:1.0 123456789.dkr.ecr.us-east-1.amazonaws.com/myapp:1.4.2
docker push 123456789.dkr.ecr.us-east-1.amazonaws.com/myapp:1.4.2
docker pull 123456789.dkr.ecr.us-east-1.amazonaws.com/myapp:1.4.2
~~~

**Never deploy "latest" to production.** "latest" is just a tag like any other — it is mutable, doesn't tell you what code is actually running, and makes rollbacks a guess. Production tagging strategy: tag with the immutable git commit SHA (or a semantic version) at build time in CI, and additionally tag "latest" only for convenience in local development. Kubernetes deployments and ECS task definitions should always reference a specific, immutable tag (or better, the image digest) so that "what's running in prod" is always answerable precisely.
`,

  "advanced-concepts": `
### Multi-stage builds — the production image pattern

A naive Dockerfile bakes the ENTIRE build toolchain (compilers, package managers, dev dependencies, source caches) into the final image — bloated and a larger attack surface. **Multi-stage builds** solve this: use one stage to build, and copy only the final artifact into a clean, minimal runtime stage.

~~~dockerfile
# BEFORE: single stage — ships uv, build tools, caches, and source in the final image
FROM python:3.12
WORKDIR /app
RUN pip install uv
COPY pyproject.toml uv.lock ./
RUN uv sync --frozen
COPY src/ src/
CMD ["uv", "run", "uvicorn", "myservice.api.main:app", "--host", "0.0.0.0", "--port", "8000"]
# Result: ~900MB+ image, full Python dev image, build tool present at runtime for no reason

# AFTER: multi-stage — this platform's own FastAPI service (api/), built with uv
FROM python:3.12-slim AS builder
COPY --from=ghcr.io/astral-sh/uv:latest /uv /usr/local/bin/uv
WORKDIR /app
COPY pyproject.toml uv.lock ./
RUN uv sync --frozen --no-install-project --no-dev
COPY src/ src/
RUN uv sync --frozen --no-dev

FROM python:3.12-slim
RUN useradd -m appuser
WORKDIR /app
COPY --from=builder /app/.venv /app/.venv
COPY src/ src/
ENV PATH="/app/.venv/bin:PATH_PLACEHOLDER" PYTHONUNBUFFERED=1
USER appuser
EXPOSE 8000
HEALTHCHECK --interval=30s --timeout=3s CMD python -c "import httpx; httpx.get('http://localhost:8000/healthz').raise_for_status()"
CMD ["uvicorn", "myservice.api.main:app", "--host", "0.0.0.0", "--port", "8000"]
# Result: ~150-200MB image. No uv binary, no build cache, no compilers in the final layer.
~~~

(Note: replace the PATH_PLACEHOLDER above with the actual shell environment-variable expansion syntax for PATH in your real Dockerfile — this page avoids writing the literal interpolation characters in prose text.)

Only the "builder" stage's final COPY --from output (the built virtual environment and source) crosses into the runtime stage; the uv binary, the lockfile-resolution cache, and any intermediate build layers are left behind. This is the single highest-leverage technique for shrinking production images and is standard practice for compiled languages (Go, Rust binaries built in one stage, copied into a "FROM scratch" or distroless final stage) as much as for Python/Node.

### Minimal and distroless base images

- **alpine**-based images (~5MB base) use musl libc instead of glibc — smaller, but occasionally trips up compiled Python wheels expecting glibc; test before committing to it.
- **-slim** variants (Debian-based, stripped of docs/build tools) are the pragmatic default for Python/Node — much smaller than the full image, glibc-compatible, fewer surprises than Alpine.
- **distroless** images (Google's gcr.io/distroless/*) ship ONLY the language runtime and your app — no shell, no package manager, no coreutils. Smallest attack surface, but you cannot "docker exec ... bash" into them for debugging, which is a deliberate tradeoff senior teams accept for production but avoid for images engineers actively debug.
- **FROM scratch** — the empty base image, used for fully static binaries (Go, Rust) with zero OS layer at all.

### Build cache mounts and BuildKit

Modern Docker builds run on **BuildKit**, which supports cache mounts that persist a directory (like a package manager's download cache) ACROSS builds without baking it into any layer:

~~~dockerfile
# syntax=docker/dockerfile:1
FROM python:3.12-slim
WORKDIR /app
COPY requirements.txt .
RUN --mount=type=cache,target=/root/.cache/pip \\
    pip install -r requirements.txt
~~~

This is different from layer caching: the pip download cache speeds up REPEATED builds (even after a requirements.txt change forces a fresh RUN) without ever appearing in the final image — a meaningful CI speedup with no image-size cost.

### Multi-architecture images (buildx)

~~~bash
docker buildx create --use
docker buildx build --platform linux/amd64,linux/arm64 -t myapp:1.4.2 --push .
~~~

buildx builds one image manifest that references architecture-specific variants; "docker pull" on an Apple Silicon Mac or an ARM-based cloud instance (AWS Graviton) transparently gets the right one. Increasingly required as ARM becomes standard in cloud compute (cost/efficiency wins) and on developer machines.

### Init systems and zombie processes

A container's PID 1 does NOT get the automatic child-reaping and signal-forwarding behavior a normal init system (systemd) provides. If your CMD forks children (or you exec a shell script that spawns background processes) without a real init, you can accumulate zombie processes and SIGTERM may not propagate to the right process. Fix with "--init" (Docker's built-in tini) or an explicit tini ENTRYPOINT:

~~~dockerfile
RUN apt-get update && apt-get install -y tini
ENTRYPOINT ["tini", "--", "python", "app.py"]
~~~

### Rootless Docker and daemon security

By default, the Docker daemon runs as root, and being in the "docker" group is equivalent to root on the host — a container escape or a misconfigured mount is a real privilege-escalation path. **Rootless mode** runs the daemon itself as an unprivileged user (using user namespaces), meaningfully shrinking the blast radius of a daemon compromise. Podman takes this further by being daemonless and rootless-by-default.

### Decision table: when NOT to reach for a plain container

| Scenario | Better tool |
|----------|-------------|
| Running untrusted, multi-tenant code | gVisor or Kata Containers (sandboxed/VM-backed runtimes) — stronger isolation than namespaces alone |
| Orchestrating dozens+ of containers with self-healing, scaling, rolling updates | Kubernetes (see the Kubernetes skill) |
| A single static binary with zero dependencies | Sometimes just ship the binary — containerization adds ops overhead for no isolation benefit in a trusted, single-tenant context |
| Extremely latency-sensitive, bare-metal-tuned workloads | Direct host process, or a VM with pinned resources |
`,

  "internal-working": `
When you run "docker run", a chain of components hands the work down from the CLI to the Linux kernel:

~~~mermaid
flowchart TD
    CLI["docker CLI"] -->|REST API call| Daemon["dockerd (Docker daemon)"]
    Daemon --> Containerd["containerd (container lifecycle manager)"]
    Containerd --> Shim["containerd-shim (one per container)"]
    Shim --> Runc["runc (OCI runtime — creates the container)"]
    Runc -->|"clone() with namespace flags"| NS["New namespaces:\npid, net, mount, uts, ipc, user"]
    Runc -->|"writes to cgroup files"| CG["cgroups:\nmemory.max, cpu.max limits"]
    Runc -->|mounts overlayfs| FS["Union filesystem:\nimage layers + writable layer"]
    NS & CG & FS --> Proc["The container's process,\nrunning as a normal Linux PID on the host"]
~~~

Step by step:

1. The **Docker CLI** sends your command as a REST API call to **dockerd**, the long-running daemon.
2. dockerd delegates actual container lifecycle management to **containerd**, a separate, CNCF-governed daemon (this split happened in 2017 so other tools, including Kubernetes, could use containerd directly without going through Docker's full stack).
3. containerd spawns a lightweight **containerd-shim** process per container — this is what keeps the container running even if dockerd or containerd itself restarts, and it's what reports exit codes back up the chain.
4. The shim invokes **runc**, the actual OCI-compliant runtime that does the low-level work: it calls the Linux "clone()" syscall with namespace flags to create new PID/net/mount/UTS/IPC/user namespaces, writes resource limits into the cgroup filesystem (cgroup v2's memory.max, cpu.max, etc.), and mounts the container's root filesystem using overlayfs — stacking the image's read-only layers with one new writable layer on top.
5. The result is an ordinary Linux process on the host — visible in "ps aux" on the host with an unfamiliar-looking PID — that simply cannot see anything outside the namespaces it was created with, and cannot exceed the resources its cgroup allows.

**The image side**: an image is a manifest (JSON metadata: what layers, in what order, what CMD/ENTRYPOINT/ENV to apply) plus a set of layer tarballs, each identified by a content hash (a SHA256 digest). This content-addressing is why layers are shareable and cacheable across images: if two images share an identical base layer, Docker stores and transfers it only once. "docker build" executes each Dockerfile instruction in its own temporary container, snapshots the resulting filesystem diff as a new layer, and discards the temporary container — repeating for every instruction, reusing cached layers whenever the instruction and its inputs are unchanged.
`,

  architecture: `
Think about Docker at two levels: the **engine architecture** on a single host, and the **application architecture** you build around containers.

### Engine architecture (single host)

~~~mermaid
flowchart TB
    subgraph Host["Docker host (Linux kernel)"]
        CLI["docker CLI"] --> API["Docker REST API"]
        API --> Daemon["dockerd"]
        Daemon --> Containerd["containerd"]
        Containerd --> Runc1["runc -> Container A"]
        Containerd --> Runc2["runc -> Container B"]
        Containerd --> Runc3["runc -> Container C"]
        Daemon --> ImgStore["Local image store\n(layers, cached)"]
        Daemon --> NetMgr["Network manager\n(bridge networks)"]
        Daemon --> VolMgr["Volume manager"]
    end
    ImgStore -->|pull/push| Registry[("Remote registry\nDocker Hub / ECR / GCR / ACR")]
~~~

The daemon owns image storage, networking, and volumes on that one host; containerd/runc own actually running processes; the registry is the only thing that crosses host boundaries — it's how images get FROM your laptop or CI runner TO the machine that will run them.

### Application architecture — how to structure a containerized app

Rules that mature teams follow:

- **One process per container.** A container should run one main process (your app, not app + database + cron all forked inside one container). This keeps images focused, logs attributable, restarts independent, and scaling granular. Need multiple processes locally? Use Compose (below) or Kubernetes pods with sidecars, not one fat container.
- **Config via environment, not baked into the image.** The same image should run in dev, staging, and prod, differing only by injected environment variables/secrets — never rebuild an image just to point it at a different database.
- **Stateless application containers; state lives in managed services or volumes.** Databases and caches either run as their OWN containers with a proper volume (Compose/dev) or, in production, as managed cloud services (RDS, ElastiCache, Cloud SQL) — see the AWS/Azure/GCP skills.
- **Logs to stdout/stderr, not to files inside the container.** Docker captures stdout/stderr as the container's log stream; writing to internal files makes logs disappear when the container is removed and breaks log aggregation.

### A typical multi-container application layout

~~~text
myservice/
├── Dockerfile              # multi-stage build for the app
├── docker-compose.yml      # local dev stack: app + Postgres + Redis
├── .dockerignore           # excludes .git, .venv, node_modules from the build context
├── src/                    # application source
└── tests/                  # test suite, run inside CI's own container step
~~~

The Dockerfile defines WHAT ships; docker-compose.yml defines HOW the pieces run together locally; in production, an orchestrator (Kubernetes manifests, an ECS task definition) takes over that "how things run together" job with production concerns (scaling, healing, secrets) that Compose doesn't handle.
`,

  "data-flow": `
Tracing one full Docker lifecycle — build, push, then run in production — end to end:

~~~mermaid
sequenceDiagram
    participant Dev as Developer / CI runner
    participant Docker as Docker CLI + daemon
    participant Reg as Registry (ECR/Docker Hub)
    participant Host as Production host / node
    participant App as Running container

    Dev->>Docker: docker build -t myapp:sha123 .
    Docker->>Docker: execute each Dockerfile instruction,\ncreate/reuse cached layers
    Docker-->>Dev: image myapp:sha123 built locally

    Dev->>Docker: docker tag myapp:sha123 registry/myapp:sha123
    Dev->>Docker: docker push registry/myapp:sha123
    Docker->>Reg: upload any NEW layers (unchanged layers skipped)
    Reg-->>Docker: push complete, digest returned

    Note over Dev,Reg: CI/CD pipeline (GitHub Actions) usually owns this build+push step

    Host->>Reg: docker pull registry/myapp:sha123 (or orchestrator does this)
    Reg-->>Host: transfer missing layers only
    Host->>Host: docker run (or kubelet via containerd)
    Host->>App: runc creates namespaces + cgroups, mounts overlayfs
    App->>App: ENTRYPOINT/CMD process starts, binds to its port
    Note over App: HEALTHCHECK / readiness probe polls until healthy
    App-->>Host: ready to receive traffic
~~~

The part worth internalizing: **build** happens once (ideally in CI, not on a laptop, so the artifact is reproducible and auditable), **push** uploads it to a registry that both CI and every runtime host can reach, and **pull + run** can happen on any number of hosts independently and repeatably from that same immutable artifact. Layer content-addressing means a host that already has most of an image's layers (from a previous deploy) only downloads the few that changed — this is why small, well-ordered layers make rollouts fast.
`,

  "production-usage": `
### How real teams run Docker

- **The build step lives in CI**, not on engineers' laptops. A GitHub Actions (or equivalent) workflow checks out code, runs "docker build" (often with buildx for multi-arch and cache mounts), tags the image with the git commit SHA, runs a vulnerability scan, and pushes to a registry — see the CI/CD and GitHub Actions skills for the full pipeline.
- **Registries are private and access-controlled** in production: Amazon ECR, Google Artifact Registry, Azure Container Registry, or a self-hosted Harbor instance, gated behind IAM/cloud identity rather than a shared Docker Hub password.
- **Orchestration replaces "docker run" in production.** Kubernetes (via a Deployment manifest) or a cloud-managed container service (AWS ECS/Fargate, Azure Container Apps, Google Cloud Run) decides WHERE and HOW MANY containers run, restarts failed ones, and rolls out new versions — see the Kubernetes, AWS, Azure, and GCP skills for the specifics of each.
- **Docker Compose is a local/dev tool, not a production orchestrator.** It's excellent for spinning up a full multi-service stack on one machine for development or integration tests; production needs the healing, scaling, and multi-host scheduling Compose doesn't provide.
- **Config and secrets are injected at deploy time**, never baked into the image: environment variables from the orchestrator, or mounted secret files from a vault (see the Secrets Management skill).

### A production docker-compose.yml — this platform's own stack pattern

~~~yaml
services:
  api:
    build:
      context: .
      dockerfile: Dockerfile
    ports:
      - "8000:8000"
    environment:
      DATABASE_URL: postgresql://appuser:apppass@db:5432/appdb
      REDIS_URL: redis://cache:6379/0
    depends_on:
      db:
        condition: service_healthy
      cache:
        condition: service_started
    healthcheck:
      test: ["CMD", "curl", "-f", "http://localhost:8000/healthz"]
      interval: 10s
      timeout: 3s
      retries: 3

  db:
    image: postgres:16-alpine
    environment:
      POSTGRES_USER: appuser
      POSTGRES_PASSWORD: apppass
      POSTGRES_DB: appdb
    volumes:
      - pgdata:/var/lib/postgresql/data
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U appuser -d appdb"]
      interval: 5s
      timeout: 3s
      retries: 5

  cache:
    image: redis:7-alpine
    volumes:
      - redisdata:/data

volumes:
  pgdata:
  redisdata:
~~~

~~~bash
docker compose up -d              # start the whole stack in the background
docker compose logs -f api        # follow just the api service's logs
docker compose down               # stop and remove containers (keeps named volumes)
docker compose down -v            # also delete volumes — wipes the database!
~~~

This mirrors the shape of nearly every real backend: an application service, a relational database for durable state, and Redis for caching/queues/rate-limiting. depends_on with a healthcheck condition ensures the API doesn't start accepting traffic before Postgres is actually ready to accept connections — plain depends_on without a healthcheck only waits for the container to START, not for the database inside it to be ready, a very common source of flaky local dev and CI runs.

### Operational defaults teams converge on

- Restart policy "unless-stopped" or "on-failure" in Compose/plain Docker so a crashed container recovers automatically.
- Log driver configured for aggregation (json-file with size limits locally; a centralized driver or sidecar in production).
- .dockerignore always present (see Best Practices) to keep build contexts small and fast.
`,

  "industry-examples": `
- **Netflix**: containerizes microservices across its Titus container-management platform (built on Docker-compatible images), scheduling tens of thousands of containers to handle global streaming workloads and batch/media-processing jobs with high density.
- **Spotify**: migrated its backend from bare-metal/VM deployments to containers early, running services in Docker on top of Kubernetes to unify deployment tooling across hundreds of engineering teams and services.
- **PayPal**: containerized large parts of its payments infrastructure to standardize deployment across a very heterogeneous, long-lived codebase, citing faster developer onboarding and more consistent environments as major wins.
- **ADP**: a large-scale enterprise example of migrating legacy, monolithic Java/.NET applications into Docker containers to modernize deployment without a full rewrite — a common and pragmatic industry pattern (containerize first, decompose later).
- **Every major AI lab/startup** (OpenAI, Anthropic, and countless smaller AI companies): model-serving endpoints, evaluation harnesses, and data pipelines are shipped as container images because GPU-driver compatibility, exact CUDA/cuDNN/PyTorch version pinning, and reproducible research environments are exactly the "works here, not there" problem Docker was built to solve.

Pattern to notice: companies rarely adopt Docker for one dramatic reason — the win compounds from faster onboarding, faster CI, consistent environments across dev/staging/prod, and higher hardware density, all at once.
`,

  "best-practices": `
1. **Order Dockerfile instructions from least to most frequently changing** — dependency manifests and installs before application source — to maximize layer-cache reuse and keep rebuilds fast.
2. **Use multi-stage builds for anything with a build toolchain** (compiling, bundling, installing dev dependencies) so the final image ships only the runtime artifact, not the tools that built it.
3. **Pin base image versions explicitly** (python:3.12-slim, not python:latest) — an unpinned base can silently change under you between builds, breaking reproducibility.
4. **Run as a non-root USER** in the final image — never leave a production container running as root; a compromised app process should not be root inside its own namespace, let alone able to leverage a kernel bug as root.
5. **Keep a .dockerignore file** (mirroring .gitignore, at minimum excluding .git, node_modules/.venv, and local secrets/env files) — a smaller build context means faster builds and, critically, no accidental inclusion of secrets or credentials in an image layer.
6. **Tag images immutably in production** — git commit SHA or semantic version, never "latest" as the deployed tag — so "what's running" is always answerable and rollbacks are a tag change, not a guess.
7. **Set explicit resource limits** (memory and CPU) on every container in production to prevent one noisy container from starving its neighbors on a shared host.
8. **Add a HEALTHCHECK (or an orchestrator-level readiness/liveness probe)** so the platform can distinguish "process is running" from "application is actually able to serve traffic."
9. **Never bake secrets into an image** — no API keys, passwords, or private keys in ENV, ARG, or COPY'd files; inject them at runtime (see Security and the Secrets Management skill).
10. **Prefer slim/distroless base images** over full OS images for production — smaller attack surface, faster pulls, fewer CVEs to patch.
11. **Log to stdout/stderr, not to files inside the container** — Docker's logging drivers and your log-aggregation stack expect this; internal log files vanish with the container.
12. **Scan images for known CVEs in CI** (Trivy, Grype, or a registry's built-in scanning) before they ever reach production, and re-scan periodically since new CVEs are discovered against unchanged images.
`,

  "anti-patterns": `
### Running as root in production

~~~dockerfile
# WRONG: container process runs as root — a compromised app has root inside its namespace
FROM python:3.12-slim
WORKDIR /app
COPY . .
CMD ["python", "app.py"]

# RIGHT: drop to an unprivileged user before the process starts
FROM python:3.12-slim
RUN useradd -m appuser
WORKDIR /app
COPY --chown=appuser:appuser . .
USER appuser
CMD ["python", "app.py"]
~~~

### Baking secrets into image layers

~~~dockerfile
# WRONG: the API key is now permanently embedded in a layer's history,
# recoverable even after a later layer "removes" it
FROM python:3.12-slim
ENV OPENAI_API_KEY=sk-thisIsBadEverywhere
COPY . .

# RIGHT: inject at runtime, never at build time
FROM python:3.12-slim
COPY . .
CMD ["python", "app.py"]
# docker run -e OPENAI_API_KEY="from-a-vault-or-CI-secret" myapp
~~~

Even deleting a secret in a LATER Dockerfile instruction does not remove it — every prior layer is still stored and pullable. Treat anything ever written into any layer as permanently public.

### One giant container running everything

Wrong: a single container running the web server, a cron daemon, and a background worker via a hand-rolled supervisor script. This defeats independent scaling, independent restarts, and clean log attribution. Right: one process per container; use Compose (locally) or separate Kubernetes Deployments (in production) for the web service, the worker, and any scheduled job.

### Copying everything before installing dependencies

~~~dockerfile
# WRONG: any source-code change invalidates the (slow) dependency-install layer
COPY . .
RUN pip install -r requirements.txt

# RIGHT: copy only the manifest first, so dependency installs stay cached
COPY requirements.txt .
RUN pip install -r requirements.txt
COPY . .
~~~

### Using "latest" as a deployment tag

Wrong: a Kubernetes manifest or ECS task definition referencing "myapp:latest". Two deploys of "latest" at different times can run completely different code with no way to tell which is live, and rollback means guessing. Right: deploy an immutable, specific tag (git SHA or semver) every time.

### Ignoring build context size

Wrong: running "docker build ." inside a directory containing .git, node_modules, a .venv, and gigabytes of local data with no .dockerignore — every build sends all of it to the daemon, and it's slow even though most of it never appears in the image. Right: a .dockerignore excluding everything the build doesn't need.
`,

  performance: `
### Measure before optimizing

~~~bash
docker build . 2>&1 | tail -20          # look at per-step timings in BuildKit output
docker history myapp:1.0                # see each layer's size, find bloat
docker system df                        # disk usage: images, containers, volumes, cache
docker stats                            # live CPU/memory/network per running container
~~~

"docker history" is the fastest way to spot a surprisingly large layer (a stray build cache, an unstripped binary, an accidental copy of the whole repo).

### The optimization hierarchy (apply in order)

1. **Fix instruction order for cache reuse** — the single highest-leverage, zero-cost change; can turn a 3-minute rebuild into a 5-second one when only source (not dependencies) changed.
2. **Use multi-stage builds** to drop build tools and intermediate artifacts from the final image — commonly cuts a Python/Node image from 800MB-1.2GB down to 100-250MB.
3. **Switch to a slim or distroless base image** — a full "python:3.12" image is roughly 900MB+; "python:3.12-slim" is roughly 130MB; a distroless Python image is smaller still. Smaller images pull faster (faster autoscaling, faster CI, faster rollback).
4. **Use BuildKit cache mounts** for package-manager caches (pip, npm, apt) so repeated builds skip re-downloading dependencies even when a manifest changes, without bloating the image.
5. **Minimize and combine RUN layers thoughtfully** — chaining related commands with "&&" in one RUN (e.g., apt-get update && apt-get install && apt-get clean) avoids leaving stale package-manager cache in an intermediate layer that then persists in the final image even after a later layer tries to remove it.
6. **Use buildx for parallel, cached, multi-arch builds** in CI — meaningfully faster than sequential single-arch builds when you need both amd64 and arm64 outputs.
7. **Right-size resource requests/limits** so the scheduler (Kubernetes) can pack containers efficiently instead of over-reserving idle capacity — this is a scheduling/cost performance lever, not just a safety one.

### Runtime performance notes

- Container **startup time** is dominated by image pull time (if not already cached on the host) plus application initialization — not by any inherent container overhead, which is near-zero once the process starts.
- **cgroup-imposed CPU limits** throttle a process even if the host has idle CPU — a container with cpu limit "0.5" can be throttled mid-burst even on an otherwise-idle machine; this trips up teams benchmarking locally with generous limits and then hitting throttling in production with tighter ones.
- **Memory limits are hard**: exceeding a container's memory limit gets it OOM-killed by the kernel, not gracefully slowed down — size limits with real headroom, informed by actual "docker stats" or orchestrator metrics observation, not guesses.
`,

  scalability: `
Docker itself runs containers on ONE host; scaling to many containers across many hosts is properly an orchestrator's job (Kubernetes, ECS, Cloud Run) — see the Kubernetes, AWS, Azure, and GCP skills for that story in depth. What's genuinely Docker-specific to scalability:

### Single-host density

~~~mermaid
flowchart LR
    LB["Load balancer"] --> C1["Container 1\n(cpu: 0.5, mem: 512Mi)"]
    LB --> C2["Container 2\n(cpu: 0.5, mem: 512Mi)"]
    LB --> C3["Container N"]
    C1 & C2 & C3 --> Host["One physical/virtual host,\nshared kernel, cgroup-isolated"]
~~~

Because containers share a kernel and start in milliseconds with megabytes of overhead (versus a VM's minutes and gigabytes), a single host can run far more containers than it could VMs — this density is the core economic argument for containers at scale, well before any orchestration is involved.

### Building images that scale well

- **Smaller images pull faster**, which matters directly for scale-out speed: when an orchestrator spins up 50 new replicas during a traffic spike, image pull time (if not cached on that node already) is pure added latency before those replicas can serve traffic.
- **Stateless containers scale horizontally trivially** — any replica can serve any request if session/state lives in Redis/Postgres rather than the container's local filesystem; this is why the "stateless app, persistent backing service" architecture (Architecture section) is the scalable default.
- **Registries themselves need to scale** — a self-hosted registry serving hundreds of nodes pulling simultaneously during a deploy needs its own capacity planning; managed registries (ECR, GCR, ACR) handle this for you.

### Known ceilings and answers

| Bottleneck | Answer |
|------------|--------|
| One host runs out of CPU/memory for more containers | Add hosts + an orchestrator to schedule across them (Kubernetes/ECS) |
| Slow image pulls during scale-out | Smaller images, a registry mirror/cache close to the compute, pre-pulling/warming nodes |
| Noisy-neighbor containers on shared hosts | cgroup CPU/memory limits per container (see Resource limits) |
| Local Docker daemon becomes a single point of build failure in CI | Distributed/cached builds (Docker Build Cloud, remote BuildKit builders, layer caching in CI) |
| Stateful containers block easy horizontal scaling | Externalize state to a managed database/cache; keep app containers stateless |
`,

  security: `
### The container-specific attack surface

- **Shared kernel**: unlike a VM, all containers on a host share one kernel. A kernel vulnerability is, in principle, a cross-container escape vector — this is the fundamental reason container isolation is weaker than VM isolation, and why untrusted multi-tenant workloads sometimes reach for gVisor or Kata Containers instead of plain runc.
- **Running as root inside the container**: if the containerized process runs as root and an attacker achieves code execution in it, a subsequent container-escape bug (or a misconfigured mount/capability) hands them root on the HOST, not just inside the sandbox. Always USER a non-root account (see Best Practices and Anti-Patterns).
- **Excess Linux capabilities**: containers get a reduced-but-still-broad default capability set. Drop everything not explicitly needed: "docker run --cap-drop=ALL --cap-add=NET_BIND_SERVICE ...".
- **Privileged containers**: "--privileged" disables almost all isolation and should essentially never be used outside of Docker-in-Docker CI runners or specific hardware-access needs, and even then, scoped as tightly as possible.
- **Mounting the Docker socket** ("-v /var/run/docker.sock:/var/run/docker.sock") into a container hands that container full control of the host's Docker daemon — equivalent to root on the host. Extremely common in CI tooling and extremely dangerous; understand exactly why before doing it.

### Defenses

1. **Non-root USER** in every image (repeated because it's the single highest-impact, lowest-effort mitigation).
2. **Minimal base images** (slim/alpine/distroless) — fewer installed packages means fewer CVEs to track and a smaller pool of tools an attacker who does get in can abuse.
3. **Image scanning in CI**: Trivy, Grype, Docker Scout, or your registry's built-in scanner, checking every build against known-CVE databases, gating merges/deploys on critical findings.
4. **Never bake secrets into images** — no API keys, DB passwords, or private keys in ENV/ARG/COPY'd files (they persist in layer history forever, even if a later layer deletes the file). Inject secrets at runtime via environment variables sourced from a vault, or mounted secret files/volumes. See the dedicated **Secrets Management** skill for the full pattern (Vault, AWS Secrets Manager, Kubernetes Secrets).
5. **Read-only root filesystem** where possible ("docker run --read-only") with an explicit writable volume only for the paths that genuinely need writes (e.g., /tmp) — stops an attacker from persisting a modified binary in the container's own filesystem.
6. **Drop Linux capabilities** to the minimum the process needs, rather than accepting Docker's default set.
7. **Verify image provenance**: pull from trusted registries, verify checksums/signatures (Docker Content Trust / Sigstore cosign) for anything running in production, and pin dependencies to avoid typosquatted or compromised public images.
8. **Keep the Docker Engine and host kernel patched** — since isolation depends on the kernel, kernel/runtime CVEs are directly security-relevant in a way they aren't for VM guests.

See the dedicated **OWASP Top 10** and **Secrets Management** skills for depth beyond the container-specific surface covered here.
`,

  testing: `
Docker enters the testing story in two distinct ways: testing an image's build/runtime correctness, and using containers to make application tests more reliable.

### Testing the Dockerfile/image itself

~~~bash
docker build -t myapp:test .
docker run --rm myapp:test python -c "import myservice; print('import ok')"
docker run --rm -p 8000:8000 -d --name test-run myapp:test
sleep 2
curl -f http://localhost:8000/healthz || (docker logs test-run && exit 1)
docker stop test-run
~~~

A minimal but real smoke test: build the image, confirm it starts, confirm the health endpoint responds — catches "the image builds but the app crashes on startup" before it ever reaches a real environment.

### Structural linting

~~~bash
hadolint Dockerfile          # lints Dockerfile for anti-patterns (missing USER, apt cache not cleaned, etc.)
docker scout cves myapp:test # or trivy image myapp:test — CVE scanning as part of the test suite
~~~

### Using Compose for integration tests

~~~yaml
# docker-compose.test.yml
services:
  tests:
    build: .
    command: pytest tests/integration
    depends_on:
      db:
        condition: service_healthy
    environment:
      DATABASE_URL: postgresql://appuser:apppass@db:5432/appdb
  db:
    image: postgres:16-alpine
    environment:
      POSTGRES_USER: appuser
      POSTGRES_PASSWORD: apppass
      POSTGRES_DB: appdb
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U appuser"]
~~~

~~~bash
docker compose -f docker-compose.test.yml up --abort-on-container-exit --exit-code-from tests
~~~

This spins up a REAL Postgres for integration tests instead of mocking the database driver — testing against the real thing catches issues (SQL dialect quirks, connection-pool behavior, migration correctness) mocks systematically miss. This is the standard pattern for CI integration-test stages; see the CI/CD and GitHub Actions skills for wiring it into a pipeline.

### The senior testing doctrine for containers

- Test the SAME image artifact you'll deploy, not a different "test build" — otherwise you're not really testing what ships.
- Keep test dependencies (pytest, hadolint, trivy) OUT of the production image; run them in CI against the built image or in a separate build stage.
- Treat a failing CVE scan as a build-breaking test, not an informational warning, for anything above your team's agreed severity threshold.
`,

  debugging: `
### The toolbox, in escalation order

1. **docker ps -a** — is the container even running, or did it exit? Check the exit code:

~~~bash
docker ps -a --format "table {{.Names}}\\t{{.Status}}"
docker inspect <container> --format "{{.State.ExitCode}}"
~~~

2. **docker logs** — the first real diagnostic step for almost everything:

~~~bash
docker logs --tail 200 -f mycontainer
~~~

3. **docker exec** — get a shell INSIDE a running container to poke around (only works if the image has a shell — distroless images won't):

~~~bash
docker exec -it mycontainer bash    # or sh, on alpine-based images
docker exec mycontainer env         # check what environment variables actually landed inside
~~~

4. **docker inspect** — the full JSON truth about a container: its mounts, network settings, resource limits, restart count:

~~~bash
docker inspect mycontainer | less
docker inspect mycontainer --format "{{.HostConfig.Memory}}"
~~~

5. **docker stats** — live resource usage; is it being OOM-killed or CPU-throttled?

~~~bash
docker stats mycontainer
~~~

6. **A debug container attached to the same namespaces** — for distroless/scratch images with no shell, attach a separate debug container sharing the target's process/network namespace:

~~~bash
docker run -it --rm --pid=container:mycontainer --net=container:mycontainer busybox sh
~~~

7. **Build-time debugging** — insert a deliberate failure point or run an intermediate stage directly:

~~~bash
docker build --target builder -t debug-stage .   # stop at a named multi-stage build stage
docker run -it debug-stage bash                  # inspect what that stage actually produced
~~~

### Common failure signatures and what they mean

- **"Exited (137)"** — the container was OOM-killed by the kernel (exit code 128+9 = SIGKILL) or received a hard "docker stop" timeout kill; check "docker stats" history and memory limits.
- **"Exited (1)"** with no useful log line — the app likely crashed before it could log anything; check for a missing environment variable or dependency the entrypoint needs before your app's own logging initializes.
- **Container runs but nothing responds on the mapped port** — check the app is actually binding to 0.0.0.0, not 127.0.0.1 (binding to localhost inside the container is unreachable from outside its network namespace), and confirm the "-p" mapping direction (host:container).
- **"Cannot connect to the Docker daemon"** — the daemon isn't running, or the current user isn't in the docker group / lacks socket permission.
`,

  monitoring: `
Container observability rests on the same three pillars as any production system (see the Observability category for depth), with Docker-specific angles on each.

### Logs

~~~bash
docker logs --since 10m mycontainer
docker inspect --format "{{.HostConfig.LogConfig.Type}}" mycontainer
~~~

Configure a log driver appropriate to your environment — "json-file" locally (with size/rotation limits set, or logs silently consume the whole disk), or a centralized driver/sidecar (Fluentd, a cloud logging agent) in production so logs survive container removal and are searchable across every replica.

### Metrics

~~~bash
docker stats --no-stream                       # one-shot snapshot: CPU %, mem usage/limit, net I/O
curl http://localhost:9323/metrics             # Docker daemon's own Prometheus metrics endpoint, if enabled
~~~

In production, per-container resource metrics usually flow through the orchestrator (Kubernetes's cAdvisor/metrics-server, feeding Prometheus) rather than being scraped from Docker directly — see the Kubernetes skill. Track, per service: container restart count (a rising count means something is crashing and being auto-restarted — investigate before it becomes an outage), memory usage against its limit (approaching the ceiling predicts an OOM-kill), and CPU throttling time (a cgroup metric showing the process wanted more CPU than its limit allowed).

### Health signals

~~~dockerfile
HEALTHCHECK --interval=30s --timeout=3s --retries=3 \\
  CMD curl -f http://localhost:8000/healthz || exit 1
~~~

~~~bash
docker inspect --format "{{.State.Health.Status}}" mycontainer   # healthy / unhealthy / starting
~~~

A HEALTHCHECK is what lets Docker (and, more importantly, an orchestrator reading the equivalent liveness/readiness probes) distinguish "the process is technically running" from "the application can actually serve traffic" — the gap that matters most in an incident.

### Tracing

Distributed tracing (OpenTelemetry) instruments the APPLICATION, not the container boundary itself — but running a collector as its own container/sidecar alongside your services is the standard container-native deployment pattern for shipping traces out.
`,

  deployment: `
### A production-grade Dockerfile, justified line by line

~~~dockerfile
# syntax=docker/dockerfile:1
FROM python:3.12-slim AS builder
# slim base: smaller than the full image, still glibc-compatible (fewer surprises than alpine)

COPY --from=ghcr.io/astral-sh/uv:latest /uv /usr/local/bin/uv
# uv: this platform's dependency manager, copied in as a static binary — not pip-installed,
# so it never needs network access inside the build for itself

WORKDIR /app
# all following instructions and the final container's cwd default here

COPY pyproject.toml uv.lock ./
# copy ONLY the dependency manifests first — maximizes layer-cache reuse (see Best Practices)

RUN uv sync --frozen --no-install-project --no-dev
# --frozen: fail if the lockfile is out of date, never silently resolve different versions
# --no-dev: skip dev-only dependencies (pytest, ruff) — they don't belong in production
# --no-install-project: install deps before source exists yet, keeping this layer cacheable

COPY src/ src/
RUN uv sync --frozen --no-dev
# now install the project itself, in a SEPARATE layer from the dependency install above

FROM python:3.12-slim
# fresh runtime stage: no uv binary, no lockfile-resolution cache, no build tools

RUN useradd -m appuser
# create an unprivileged user — never run the final process as root

WORKDIR /app
COPY --from=builder /app/.venv /app/.venv
COPY src/ src/
# copy ONLY the built virtual environment and source from the builder stage

ENV PYTHONUNBUFFERED=1
# Python's stdout is fully buffered when not attached to a real terminal —
# unbuffered output means logs stream immediately instead of appearing in delayed batches

USER appuser
# drop to the unprivileged user for everything from here on, including the running process

EXPOSE 8000
# documentation: this app listens on 8000 (does not itself publish the port)

HEALTHCHECK --interval=30s --timeout=3s --retries=3 \\
  CMD python -c "import httpx; httpx.get('http://localhost:8000/healthz').raise_for_status()"
# lets Docker/the orchestrator tell "running" apart from "actually serving traffic"

CMD ["uvicorn", "myservice.api.main:app", "--host", "0.0.0.0", "--port", "8000"]
# --host 0.0.0.0 is required: binding to localhost/127.0.0.1 would be unreachable
# from outside the container's own network namespace
~~~

### Serving topology and rollout

- **One process per container**; scale by running MORE container replicas (via Kubernetes or ECS), not more internal worker processes crammed into one container — this keeps scaling, restarts, and resource accounting granular and orchestrator-visible.
- **Health endpoints wired to orchestrator probes**: liveness (is the process alive at all) and readiness (can it currently serve traffic, e.g., is its database connection up) are DIFFERENT checks with different consequences (liveness failure restarts the container; readiness failure just removes it from load-balancer rotation temporarily).
- **Graceful shutdown**: your app must handle SIGTERM by finishing in-flight requests and exiting cleanly within the orchestrator's grace period, or it gets SIGKILLed mid-request during every rollout.

### CI/CD pipeline shape (see CI/CD and GitHub Actions skills for the full pipeline)

lint the Dockerfile (hadolint) -> build the image (buildx, cached) -> run tests against the built image -> scan for CVEs (Trivy) -> tag with the git SHA -> push to the registry -> deploy (rolling update) referencing that exact immutable tag.
`,

  "production-checklist": `
Before a containerized service takes real production traffic:

- [ ] Multi-stage Dockerfile — no build tools, compilers, or dev dependencies in the final image
- [ ] Base image pinned to a specific tag/digest, not "latest"
- [ ] Final image runs as a non-root USER
- [ ] .dockerignore excludes .git, local env files, and anything not needed in the build context
- [ ] No secrets in ENV/ARG/COPY'd files — secrets injected at runtime from a vault or orchestrator secret store
- [ ] Image scanned for CVEs in CI, with a defined severity threshold that blocks deploys
- [ ] HEALTHCHECK (or orchestrator liveness/readiness probes) defined and verified to actually detect a broken app, not just a running process
- [ ] Deployed with an immutable tag (git SHA or semver) — never "latest" in production manifests
- [ ] Explicit CPU and memory limits set, sized from real observed usage, not guessed
- [ ] Logs go to stdout/stderr and are captured by a log-aggregation pipeline
- [ ] Graceful SIGTERM handling verified (stop a container, confirm in-flight requests drain before exit)
- [ ] Config sourced from environment variables/orchestrator config, validated at startup
- [ ] Persistent state (databases, uploads) on named volumes or managed cloud services — never relying on a container's writable layer
- [ ] Networking uses a user-defined network/service mesh with least-privilege connectivity between services
- [ ] Rollback plan verified: redeploying the previous immutable tag is a tested, fast procedure
- [ ] Build reproducible in CI from a clean checkout — no "works on my machine" build steps
`,

  "common-mistakes": `
1. **Running the final container as root** — the default if you never add a USER instruction; escalates the blast radius of any app-level compromise.
2. **Copying the whole source tree before installing dependencies** — invalidates the expensive dependency-install layer on every single code change, making every rebuild slow.
3. **Deploying "latest" to production** — makes "what's actually running" and rollback both a guess instead of a fact.
4. **Baking secrets into ENV or COPY'd config files** — they persist in layer history forever, recoverable even after a later instruction "removes" them.
5. **No .dockerignore** — slow builds from a huge context, and a real risk of accidentally copying .git history, .env files, or credentials into an image layer.
6. **Treating EXPOSE as if it publishes a port** — it's documentation only; forgetting "-p" or a compose "ports:" entry means nothing is actually reachable.
7. **No resource limits** — one runaway container can consume all of a shared host's memory/CPU and take down unrelated neighbors (the classic noisy-neighbor problem).
8. **Storing durable data only in the container's writable layer** — "docker rm" silently destroys it; anything that must survive needs a named volume or a managed external store.
9. **Binding the app to 127.0.0.1 instead of 0.0.0.0 inside the container** — unreachable from outside the container's network namespace even with a correct port mapping.
10. **No HEALTHCHECK/readiness probe** — the orchestrator (or Docker itself) can't tell "running" apart from "actually working," so a hung-but-alive process keeps receiving traffic.
`,

  "common-errors": `
| Error | Typical cause | Fix |
|-------|---------------|-----|
| Cannot connect to the Docker daemon | Daemon not running, or user lacks socket permission | Start Docker Desktop/daemon; add user to the docker group (or use sudo) |
| Bind: address already in use | Another process (or container) already holds the host port | Pick a different host port, or stop the conflicting process/container |
| Exited (137) | OOM-killed by the kernel, or a stop-timeout SIGKILL | Check docker stats / memory limit; raise the limit or fix a leak |
| Exited (1) with an empty log | App crashed before logging anything, often a missing env var | docker inspect the env; run interactively to see the real startup error |
| No such file or directory (in COPY) | Path is wrong relative to the build context, or excluded by .dockerignore | Confirm the build context root and .dockerignore contents |
| Connection refused between Compose services | Using the wrong hostname, or not on the same user-defined network | Use the service name as hostname; confirm both are on the same compose network |
| Image builds but never picks up code changes | Stale cached layer, or bind mount shadowing the built code | docker build --no-cache to confirm; check bind mounts in compose |
| denied: requested access to the resource is denied | Not authenticated to the registry, or wrong repository path | docker login; confirm the full registry/namespace/repo path and permissions |
| Read-only file system | Container run with --read-only but the app writes somewhere unexpected | Mount a writable volume for the specific path the app needs (e.g., /tmp) |
| No space left on device | Accumulated unused images/containers/volumes filling disk | docker system prune -a --volumes (after confirming nothing needed is deleted) |

The habit that matters: "docker logs" and "docker inspect" first, before guessing — the exit code and the JSON inspect output usually name the actual cause directly.
`,

  faqs: `
**Q: Is Docker the same thing as a virtual machine, just smaller?**
No. A VM virtualizes hardware and boots its own kernel; a container is an isolated process sharing the HOST's kernel via namespaces and cgroups. That's why containers start in milliseconds versus a VM's minutes, and why container isolation is weaker than VM isolation (see Security).

**Q: Do I need Kubernetes if I already use Docker?**
Only once you need to run containers across MORE THAN ONE machine reliably — with self-healing, scaling, and rolling updates. Docker alone runs containers on one host; see the Kubernetes skill for the multi-host story. Many teams start with a simpler managed option (AWS ECS/Fargate, Google Cloud Run) before Kubernetes.

**Q: Why shouldn't I use the "latest" tag in production?**
Because it's mutable — "latest" points to whatever was last pushed with that tag, so two deploys at different times can silently run different code, and rollback becomes guesswork. Deploy immutable tags (a git commit SHA or semantic version) instead.

**Q: What's the difference between a volume and a bind mount?**
A named volume is storage Docker manages and owns the location of — portable, the production default for persistence. A bind mount maps a specific path from the HOST machine directly into the container — convenient for local development (instant code reflection) but not something you want to depend on in production, where "the host filesystem" isn't a stable concept across a fleet of machines.

**Q: Is Docker Compose good enough for production?**
Generally no, for anything beyond a single-host hobby deployment. Compose doesn't provide self-healing across hosts, rolling updates with health-gated rollout, or multi-host scheduling — that's Kubernetes's or a managed platform's job. Compose shines for local development and CI integration-test stacks.

**Q: Alpine or slim base images — which should I default to?**
"-slim" (Debian-based) is usually the safer default for Python/Node — same glibc as most prebuilt wheels/binaries expect, fewer surprises, still much smaller than the full image. Alpine (musl libc) is smaller still but occasionally breaks compiled dependencies that assume glibc; test thoroughly before committing to it for anything with native extensions.

**Q: How do secrets get into a running container safely?**
Never through ENV/ARG baked at build time. At runtime, via environment variables injected by the orchestrator from a secret store (Kubernetes Secrets, AWS Secrets Manager, HashiCorp Vault), or mounted as files from that same store — see the dedicated Secrets Management skill.
`,

  "interview-questions": `
**Junior/Mid:**

1. *What is the difference between an image and a container?* An image is an immutable, layered template (like a class); a container is a running (or stopped) instance of that image with one writable layer added on top (like an object). One image, many containers.
2. *What does the Dockerfile EXPOSE instruction actually do?* Documents which port the app listens on for humans and tooling — it does NOT publish the port. Publishing requires "-p" on docker run or a "ports:" entry in Compose.
3. *Explain CMD vs ENTRYPOINT.* ENTRYPOINT fixes the executable that always runs; CMD supplies default arguments to it that "docker run" can override without retyping the whole command. Bare CMD alone is fully replaceable; ENTRYPOINT plus CMD is the "fixed binary, overridable args" pattern.
4. *Why does instruction order matter in a Dockerfile?* Docker caches each layer and reuses it only if that instruction and everything before it is unchanged; ordering from least-to-most frequently changing (dependencies before source code) keeps rebuilds fast.
5. *What's the difference between a volume and a bind mount?* A volume is Docker-managed storage, portable and the production default; a bind mount maps a specific host path in, convenient for local dev hot-reload but not something to rely on in production.

**Senior:**

6. *Explain, precisely, how a container differs from a VM.* A VM virtualizes hardware via a hypervisor and boots an independent guest kernel — strong, hardware-enforced isolation, minutes to start, GBs of overhead. A container is a normal host process isolated by Linux namespaces (PID, net, mount, UTS, IPC, user) and constrained by cgroups (CPU/memory limits), with its filesystem assembled from overlayfs-stacked image layers — software-enforced isolation sharing one kernel, milliseconds to start, MBs of overhead. Strong answers name the specific kernel mechanisms, not just "containers are lighter."
7. *Walk through what happens end to end from "docker run" to a running process.* CLI calls the daemon's API -> dockerd delegates to containerd -> containerd spawns a shim -> the shim invokes runc -> runc clones the process with new namespace flags, writes cgroup limits, mounts overlayfs -> the result is an ordinary Linux process on the host, isolated by what it can't see/exceed.
8. *Why is a multi-stage build a security AND performance win, not just a size optimization?* Smaller size means fewer packages/binaries present, which directly shrinks the CVE surface and the tools available to an attacker who gains code execution — it's not merely about faster pulls.
9. *Design a Dockerfile for a compiled Go service versus a Python service — what changes?* Go: build stage compiles a static binary, final stage can be "FROM scratch" or distroless with just that binary — often single-digit MB images with essentially zero attack surface beyond the app itself. Python: the interpreter and installed packages must ship in the runtime stage (can't compile away the runtime), so the floor is a slim/distroless Python base plus the venv — inherently larger than a static Go binary.
10. *How would you debug a container that starts, appears "Up", but never responds to requests?* Check the app is bound to 0.0.0.0 not localhost; check the port mapping direction; docker exec in (if there's a shell) and curl localhost directly inside the container to isolate "app problem" from "network/port-mapping problem"; check HEALTHCHECK/inspect status; check logs for a silent hang (e.g., waiting on a DB connection that never resolves).
11. *Why is running "--privileged" or mounting the Docker socket into a container dangerous?* Both effectively hand the container root-equivalent control of the HOST — "--privileged" disables most isolation controls, and a mounted Docker socket lets the container command the host's own Docker daemon (e.g., to launch a new privileged container itself). Treat both as "this container IS root on the host" for threat-modeling purposes.
12. *When would you reach for gVisor/Kata Containers instead of plain Docker/runc?* When running genuinely untrusted, multi-tenant code where the shared-kernel attack surface of standard containers is an unacceptable risk — these provide a stronger (VM-like or syscall-filtered) isolation boundary at some performance cost, for scenarios like public code-execution platforms.
`,

  "coding-questions": `
### 1. Write a Dockerfile that fixes a given set of bad practices (asked constantly)

~~~dockerfile
# GIVEN (bad): single stage, root user, no cache-friendly ordering, latest base
# FROM python:latest
# COPY . .
# RUN pip install -r requirements.txt
# CMD ["python", "app.py"]

# FIXED:
FROM python:3.12-slim AS builder
WORKDIR /app
COPY requirements.txt .
RUN pip install --no-cache-dir --user -r requirements.txt

FROM python:3.12-slim
RUN useradd -m appuser
WORKDIR /app
COPY --from=builder /root/.local /home/appuser/.local
COPY --chown=appuser:appuser . .
ENV PATH="/home/appuser/.local/bin:PATH_PLACEHOLDER"
USER appuser
EXPOSE 8000
CMD ["python", "app.py"]
~~~

(Replace PATH_PLACEHOLDER with the actual shell PATH-append interpolation syntax in a real file.) Fixes applied: pinned base image, multi-stage to drop build cache, non-root user, dependency layer cached separately from source, ownership set correctly for the new user.

### 2. Given a list of image layer sizes and instructions, predict what rebuilds after a change

~~~text
Given this Dockerfile and a change to ONLY app/routes.py, which layers rebuild?

FROM node:20-alpine        # layer 1 - unaffected, no change
WORKDIR /app                # layer 2 - unaffected
COPY package*.json ./       # layer 3 - unaffected, package.json unchanged
RUN npm ci                  # layer 4 - unaffected, cached (depends only on layer 3's output)
COPY . .                    # layer 5 - REBUILDS: app/routes.py is part of "."
CMD ["node", "server.js"]   # layer 6 - REBUILDS: every layer after an invalidated one rebuilds too
~~~

Answer: layers 1-4 are reused from cache untouched; layer 5 (COPY . .) rebuilds because its input changed, and every instruction AFTER an invalidated layer also rebuilds, even if that instruction's own inputs didn't change — cache validity is sequential, not independent per instruction.

### 3. Debug a broken docker-compose networking setup

~~~yaml
# GIVEN (broken): api can't reach the database
services:
  api:
    build: .
    environment:
      DATABASE_URL: postgresql://user:pass@localhost:5432/appdb   # BUG
  db:
    image: postgres:16-alpine

# FIXED:
services:
  api:
    build: .
    environment:
      DATABASE_URL: postgresql://user:pass@db:5432/appdb   # use the SERVICE NAME, not localhost
    depends_on:
      db:
        condition: service_started
  db:
    image: postgres:16-alpine
~~~

The bug: "localhost" inside the api container refers to the api container's OWN network namespace, not the db container — Compose's embedded DNS resolves other services by their SERVICE NAME on the shared compose network, so the connection string must target "db", not "localhost". Follow-up they'll ask: what if depends_on isn't enough because Postgres takes a moment to accept connections after its container starts? Add a healthcheck to db and a "condition: service_healthy" on api's depends_on.
`,

  "hands-on-labs": `
### Lab 1 — Containerize a small script (beginner, ~1h)
Take any small Python or Node script with one or two dependencies and write a Dockerfile from scratch: FROM, WORKDIR, COPY, RUN install, CMD. Build it, run it, confirm the output matches running it locally. Stretch: add a .dockerignore and confirm the build context shrinks. Skills: the full basic instruction set, build vs run.

### Lab 2 — Optimize a slow-rebuilding Dockerfile (intermediate, ~2h)
Given a Dockerfile that COPYs everything before installing dependencies, time a rebuild after a one-line source change, then reorder instructions correctly and re-time it. Convert it to a multi-stage build and compare final image sizes with "docker images". Deliverable: a short table of before/after build time and image size, with one paragraph explaining why. Skills: layer caching, multi-stage builds, measurement discipline.

### Lab 3 — Full local stack with Compose (intermediate/advanced, ~3h)
Build a docker-compose.yml running a small API, Postgres, and Redis (mirroring the Production Usage example on this page). Wire up healthchecks so the API waits for Postgres to be truly ready. Add a named volume for Postgres data and prove data survives a "docker compose restart" but is wiped by "docker compose down -v". Skills: Compose, networking, volumes, healthchecks.

### Lab 4 — Harden and ship a production image (production, ~3h)
Take Lab 3's API image and: switch to a multi-stage build, drop to a non-root USER, add a HEALTHCHECK, set memory/CPU limits at run time, run a CVE scan (Trivy) and fix any critical findings, then tag it with a fake "git SHA" and push it to a local registry (or Docker Hub test repo) — never "latest". Skills: the entire Security, Deployment, and Production Checklist sections, applied end to end.
`,

  "real-projects": `
Portfolio-grade projects (each maps to skills employers screen for):

1. **Multi-service AI inference stack** — Containerize a FastAPI inference service, a Redis cache for repeated prompts/results, and a Postgres store for request logs, wired together with Compose for local dev and a production-grade multi-stage Dockerfile for the API. Add healthchecks, resource limits, and a CI pipeline (see CI/CD skill) that builds, scans, and pushes on every merge to main. Demonstrates: full-stack container literacy, security hardening, CI integration.

2. **Image-size golf challenge, documented** — Start from a naive single-stage Dockerfile for a real app (a few hundred MB+) and iteratively shrink it: multi-stage build, slim then distroless base, dependency pruning, BuildKit cache mounts. Document each step's image size and build time in a README with a before/after table and explanation of every technique used. Demonstrates: deep understanding of layers, caching, and image construction — a strong "explain your reasoning" interview artifact.

3. **A tiny from-scratch container runtime** — Using Linux namespaces (unshare/clone via a language with the right bindings, or directly in C/Go) and cgroups, build a minimal tool that can start an isolated process with its own PID/mount/network namespace and a memory limit — essentially a toy runc. Demonstrates: genuine understanding of what Docker is actually built on, well beyond "knows the CLI" — a standout for senior infrastructure interviews.

Each project: a real .dockerignore, pinned base images, non-root users, a README with an architecture diagram, and (for project 1) a working CI pipeline — the engineering discipline around the containers is what gets senior interviews.
`,

  "case-studies": `
### The dockershim deprecation (Kubernetes, 2020-2022)
Kubernetes originally talked to Docker directly through a compatibility shim ("dockershim"). As the ecosystem standardized on the Container Runtime Interface (CRI), Kubernetes deprecated and removed dockershim, moving to talk to containerd directly. Because Docker-built images are OCI-compliant, images kept working fine — only the RUNTIME path changed, not the image FORMAT. Lesson: standardizing on an open format (OCI) meant an entire ecosystem could swap out an internal implementation detail without breaking a single Dockerfile anyone had written — a strong argument for building on open standards rather than vendor-specific formats.

### Instagram/Meta-scale container density (industry pattern, illustrative)
Large-scale web companies commonly report running many containers per physical host with cgroup-enforced limits, versus the far lower density achievable with one-VM-per-service — the economic case for containers at fleet scale is density plus faster provisioning, not any single feature. Lesson: the biggest real-world win from containers is often boring and financial (hardware utilization), not the more visible "reproducible dev environment" benefit engineers usually cite first.

### Docker Hub rate limiting (2020) and the registry dependency lesson
Docker Hub introduced pull-rate limits for anonymous and free-tier accounts, which broke CI pipelines across the industry that anonymously pulled public base images on every build. Teams had to add authentication, mirror images into their own registries (ECR/GCR/ACR), or cache base images locally. Lesson: a registry is a production dependency like any other external service — an unauthenticated, unmirrored dependency on a third-party registry is a real availability risk for your own CI/CD pipeline.

### The Docker Desktop licensing change (2021)
Docker, Inc. introduced paid licensing for Docker Desktop at larger companies, which accelerated enterprise interest in alternatives (Podman, Rancher Desktop, colima, direct Linux VM setups). Because Docker had earlier open-sourced the core image/runtime spec as OCI, alternative tools could be largely drop-in compatible. Lesson: even a wildly successful open-source-rooted product can introduce commercial friction later — betting on the open standard (OCI images, not "Docker Desktop specifically") kept teams' actual artifacts portable regardless of tooling choices.
`,

  comparisons: `
| Dimension | Docker | Podman | containerd (direct) | LXC/LXD | A full VM (e.g. via a hypervisor) |
|-----------|--------|--------|----------------------|---------|-------------------------------------|
| Isolation model | Namespaces + cgroups, shared kernel | Namespaces + cgroups, shared kernel | Namespaces + cgroups, shared kernel | Namespaces + cgroups, shared kernel | Hypervisor-virtualized hardware, own kernel |
| Daemon | Yes (dockerd), root by default (rootless available) | No daemon — rootless by default | Yes, but usually driven by another tool (Kubernetes, Docker) | Daemon-ish (LXD) | Hypervisor, not a daemon in the same sense |
| Startup time | Milliseconds | Milliseconds | Milliseconds | Milliseconds | Seconds to minutes |
| Isolation strength | Software (kernel-shared) | Software (kernel-shared) | Software (kernel-shared) | Software (kernel-shared) | Hardware-enforced, strongest |
| Tooling/UX | Richest ecosystem, Compose, huge community | Docker-CLI-compatible, systemd-friendly | Low-level, meant to be driven by other tools | Feels like a "full lightweight OS", less app-centric | Full OS management tooling |
| Typical use | The default choice for app containerization | Security-conscious teams wanting no root daemon | Kubernetes and other orchestrators' runtime layer | OS-level virtualization, "pet" containers | Untrusted/multi-tenant workloads, strict isolation needs |

**How seniors choose**: Docker remains the default for developer experience and ecosystem maturity (Compose, Docker Hub, universal familiarity). Podman is a compelling drop-in replacement when the root daemon itself is a security concern. containerd/CRI-O are chosen when Kubernetes is already doing the orchestrating and a full Docker install is unnecessary overhead. Plain VMs (or VM-backed runtimes like Kata Containers/gVisor for hardened containers) come back into the picture specifically when isolation strength matters more than density or startup speed — running genuinely untrusted code being the clearest case.
`,

  "related-technologies": `
- **Kubernetes** — orchestrates many containers across many hosts: scheduling, self-healing, scaling, rolling updates. Learn this next once you're comfortable containerizing single applications — see the **Kubernetes** skill.
- **AWS (ECS/EKS/Fargate) / Azure (AKS/Container Apps) / GCP (GKE/Cloud Run)** — where containers actually run in production; each cloud provider has both a managed Kubernetes offering and a simpler container-specific service. See the **AWS**, **Azure**, and **GCP** skills.
- **CI/CD and GitHub Actions** — the pipeline stage that builds, tests, scans, and pushes the images this page teaches you to write. See the **CI/CD** and **GitHub Actions** skills for wiring a full build-push-deploy pipeline.
- **Terraform** — provisions the underlying infrastructure (clusters, registries, networking) that runs your containers; containers and infrastructure-as-code are usually adjacent concerns in the same deployment pipeline. See the **Terraform** skill.
- **containerd / runc / BuildKit** — the lower-level components Docker itself is built from (see Internal Working); worth knowing by name even if you rarely interact with them directly.
- **Podman** — a daemonless, rootless-by-default, largely CLI-compatible alternative runtime.
- **Kata Containers / gVisor** — hardened, more isolated container runtimes for untrusted workloads.
- **Docker Compose** — the local multi-service orchestration tool covered in depth on this page; the natural stepping stone toward Kubernetes manifests.
- **Secrets Management** — how credentials actually reach a running container safely; see the dedicated **Secrets Management** skill.

On this platform, the natural next pages: **Docker** → **Kubernetes** → **CI/CD / GitHub Actions** → **AWS/Azure/GCP** (choose your cloud) → **Terraform**.
`,

  "latest-updates": `
Verified against my knowledge through early-to-mid 2025 — check docs.docker.com and the Moby/containerd release notes for anything newer.

- **BuildKit is the default builder** for all modern Docker installations, bringing cache mounts, better parallelism, and richer Dockerfile syntax (the "# syntax=docker/dockerfile:1" directive line) as the norm rather than an opt-in.
- **docker compose** (the integrated Go-based CLI plugin, invoked as "docker compose" with a space) has fully superseded the old standalone Python "docker-compose" (hyphenated) tool, which is in maintenance/legacy status.
- **buildx and multi-architecture builds** are now standard practice as ARM (Apple Silicon developer machines, AWS Graviton in production) has become mainstream rather than a niche concern.
- **Docker Scout** (Docker's own image analysis/CVE-scanning product) has matured as an integrated alternative to running a separate Trivy/Grype step, though many teams still use the third-party scanners for CI portability.
- **Continued rootless and daemonless momentum**: Podman's adoption and Docker's own rootless mode both reflect an industry-wide push toward reducing the root-daemon attack surface that classic Docker relies on by default.
- **WebAssembly (Wasm) as an emerging, adjacent workload format**: some orchestrators (including newer containerd shims) can run Wasm modules alongside OCI containers — worth being aware of as a "beyond containers" direction, though OCI containers remain completely dominant for mainstream application deployment as of this writing.

Given how fast this space moves, verify anything version-specific (exact CVE-scanner defaults, exact BuildKit feature flags) against current docs.docker.com before quoting it in an interview or a design doc.
`,

  "future-roadmap": `
Where container tooling is heading, and what's worth betting career time on:

1. **Rootless and daemonless becomes the default expectation**, not a hardened opt-in — driven by security posture requirements across the industry and Podman's continued adoption pushing Docker's own rootless mode forward.
2. **WebAssembly as a lighter-weight sibling to containers** for specific workloads (edge compute, plugin sandboxes) — not a replacement for OCI containers in general application deployment, but a real complementary tool worth watching, especially at the edge where even container-level overhead matters.
3. **Supply-chain security keeps tightening**: image signing (Sigstore/cosign), SBoM (Software Bill of Materials) generation as a standard build-pipeline step, and stricter provenance verification before deploy — increasingly a compliance requirement, not just a best practice, in regulated industries.
4. **Multi-architecture as the unremarkable default**: ARM in both developer machines and cloud compute (cost/efficiency wins) means buildx multi-arch builds move from "advanced technique" to "just how you build images."
5. **The orchestration layer keeps absorbing complexity**: Docker itself keeps getting simpler and more focused on the developer inner loop (build, run, debug locally, Compose for local multi-service dev), while Kubernetes and managed cloud container services absorb essentially all production-scale concerns.

For your career: understanding namespaces/cgroups/OCI standards deeply is durable knowledge that outlives any specific tool's popularity (Docker vs Podman vs whatever comes next) — bet on the underlying Linux and OCI-standard concepts, and treat the CLI/tool-of-the-moment as a comparatively replaceable skin on top of them.
`,

  "cheat-sheet": `
~~~bash
# --- Images ---
docker build -t myapp:1.0 .                  # build from Dockerfile in cwd
docker images                                 # list local images
docker rmi myapp:1.0                          # remove an image
docker history myapp:1.0                      # inspect layers and sizes
docker tag myapp:1.0 registry/myapp:1.4.2     # add a registry-qualified tag

# --- Containers ---
docker run -d --name web -p 8000:8000 myapp:1.0   # run detached, map port
docker ps -a                                       # list containers (all states)
docker logs -f web                                 # follow logs
docker exec -it web bash                           # shell inside a running container
docker stop web && docker rm web                   # stop, then remove
docker inspect web                                 # full JSON details
docker stats                                        # live CPU/mem/net usage

# --- Registries ---
docker login registry.example.com
docker push registry/myapp:1.4.2
docker pull registry/myapp:1.4.2

# --- Dockerfile essentials ---
# FROM base:tag            - starting image
# WORKDIR /app              - sets cwd for following instructions + runtime
# COPY src dest              - copy files into the image
# RUN command                - execute at BUILD time, new layer
# ENV KEY=value               - runtime environment variable
# ARG KEY=default              - BUILD-time-only variable
# EXPOSE port                   - documentation only, does not publish
# USER appuser                   - drop root before the process runs
# HEALTHCHECK CMD ...              - let Docker judge "actually healthy"
# ENTRYPOINT ["exe"]                - fixed executable
# CMD ["arg1", "arg2"]                - default args (overridable) to ENTRYPOINT

# --- Compose ---
docker compose up -d              # start the stack
docker compose logs -f api        # follow one service's logs
docker compose down               # stop + remove containers (keeps volumes)
docker compose down -v            # also remove named volumes

# --- Volumes & networks ---
docker volume create pgdata
docker run -v pgdata:/var/lib/postgresql/data postgres:16   # named volume
docker run -v "$(pwd)/src:/app/src" myapp:1.0                # bind mount
docker network create mynet
docker run --network mynet --name db postgres:16             # name-based DNS

# --- Cleanup ---
docker system df                  # disk usage summary
docker system prune -a --volumes  # reclaim space (CAREFUL: removes unused everything)
~~~
`,

  "flash-cards": `
| Front | Back |
|-------|------|
| What are the three Linux kernel mechanisms containers rely on? | Namespaces (isolation), cgroups (resource limits), union filesystem/overlayfs (layered filesystem) |
| Image vs container? | Image = immutable template; container = a running (or stopped) instance of it, plus a writable layer |
| What does EXPOSE actually do? | Documents the app's listening port — does NOT publish it; "-p" or compose "ports:" does that |
| CMD vs ENTRYPOINT? | ENTRYPOINT fixes the executable; CMD supplies default, overridable arguments to it |
| Why does instruction order matter? | Layer caching: a changed instruction invalidates its own layer AND every layer after it |
| Why use a multi-stage build? | Ship only the runtime artifact, not the build toolchain — smaller image, smaller attack surface |
| Volume vs bind mount? | Volume: Docker-managed, portable, production default. Bind mount: maps a host path in, great for local dev |
| Why never deploy "latest"? | It's mutable — you can't know what code is running, and rollback becomes a guess |
| Why run as a non-root USER? | Limits blast radius: a compromised root process inside the container is closer to root on the host |
| What's the #1 container security risk vs a VM? | Shared kernel — a kernel exploit can, in principle, cross container boundaries; VMs have hardware-enforced isolation |
| What does HEALTHCHECK solve? | Lets the platform tell "process is running" apart from "app is actually able to serve traffic" |
| bridge vs host vs none network mode? | bridge: isolated virtual network (default, needs port mapping); host: shares host's network directly; none: no networking at all |
| Why mounting the Docker socket into a container is dangerous? | It hands that container control of the HOST's Docker daemon — equivalent to root on the host |
| What's the OCI? | Open Container Initiative — the standard image/runtime spec that keeps Docker-built images portable across containerd, Podman, CRI-O, etc. |
| Named volumes vs writable layer for persistence? | Writable layer disappears with the container; named volumes are Docker-managed and survive container removal |
`,

  mcqs: `
**1. A container starts noticeably faster than a VM primarily because:**

A) Containers use less disk space  B) Containers share the host's kernel instead of booting their own  C) Containers use a faster CPU scheduler  D) Containers don't use a filesystem

**Answer: B** — no kernel boot is needed; the container is just a new set of namespaces/cgroups around an existing kernel.

**2. Given this Dockerfile fragment, which change forces the RUN npm ci layer to rebuild?**

~~~dockerfile
FROM node:20-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
CMD ["node", "server.js"]
~~~

A) Editing server.js  B) Editing package.json  C) Editing README.md  D) Changing the CMD's arguments

**Answer: B** — only a change to package*.json (the input to that COPY) invalidates the RUN npm ci layer; server.js is copied in a later instruction.

**3. What does the "latest" tag guarantee about the image it points to?**

A) It is always the newest, most stable release  B) Nothing — it's just a mutable tag like any other  C) It is automatically security-scanned  D) It cannot be overwritten

**Answer: B** — "latest" has no special enforced meaning; it's a convention, and it changes whenever someone pushes with that tag.

**4. Which Docker network mode gives a container no isolated network namespace at all, sharing the host's directly?**

A) bridge  B) none  C) host  D) overlay

**Answer: C** — host mode skips network namespace isolation; the container uses the host's network stack directly.

**5. Why is baking a secret into an ENV instruction still a leak even if a LATER instruction removes it?**

A) It isn't a leak, removal fully cleans it up  B) Every layer, including earlier ones, is stored and remains extractable from the image  C) ENV variables are encrypted at rest by default  D) Only ARG values persist, not ENV

**Answer: B** — Docker images are a stack of immutable layers; a later layer "removing" something doesn't delete it from the earlier layer's stored contents.

**6. What's the primary purpose of a multi-stage build?**

A) To run tests automatically  B) To support multiple CPU architectures  C) To keep build-only tools and artifacts out of the final runtime image  D) To enable Docker Compose networking

**Answer: C** — multi-stage builds copy only the needed artifact from a build stage into a clean final stage, dropping compilers/dev-dependencies/build caches from what ships.
`,

  "revision-notes": `
**Core model in 5 lines:** A container is an isolated Linux process, not a mini VM — isolation comes from namespaces (what it can see), limits come from cgroups (what it can consume), and its filesystem is assembled from stacked, immutable image layers via overlayfs. An image is the immutable template; a container is a running instance of it plus one writable layer. VMs virtualize hardware and boot their own kernel (strong isolation, slow, heavy); containers share the host kernel (weaker isolation, fast, light).

**Dockerfile in 5 lines:** FROM sets the base; WORKDIR/ENV/ARG configure the build and runtime environment; COPY/RUN build up layers (order least-to-most frequently changing for cache reuse); EXPOSE documents a port without publishing it; USER drops root before the final process runs; CMD supplies default, overridable arguments to a fixed ENTRYPOINT (or stands alone as the whole default command). Multi-stage builds copy only the finished artifact into a clean final stage, dropping build tools entirely.

**Runtime and registries in 4 lines:** docker build creates/reuses cached layers locally; docker push/pull move only the layers a remote/local side doesn't already have, thanks to content-addressed layer hashes; registries (Docker Hub, ECR, GCR, ACR, private) are where images live between build and run; never deploy "latest" — tag immutably (git SHA/semver) so what's running is always answerable and rollback is a tag change.

**Local dev and persistence in 4 lines:** Docker Compose runs a multi-service local stack (app + Postgres + Redis is the canonical shape) with a shared user-defined network giving name-based DNS between services. Named volumes are Docker-managed and survive container removal — the production-persistence default; bind mounts map a host path in and are ideal for local hot-reload but not production. bridge/host/none are the three network modes, trading isolation for directness.

**Production and security in 5 lines:** Non-root USER, minimal (slim/distroless) base images, CVE scanning in CI, and never baking secrets into any layer are the core security defaults. Resource limits (memory/CPU via cgroups) prevent noisy neighbors; HEALTHCHECK (or orchestrator liveness/readiness probes) lets the platform tell "running" apart from "actually working." Docker itself runs on one host — Kubernetes or a managed cloud container service takes over scheduling, healing, and scaling across many hosts.
`,

  "learning-roadmap": `
A realistic path to solid, production-grade Docker fluency (adjust pace to your background):

**Week 1 — Foundations.** Beginner Concepts section + Lab 1. Build and run a Dockerfile for one small script daily until "FROM/WORKDIR/COPY/RUN/CMD" is muscle memory. Milestone: containerize something you actually use.

**Week 2 — The full instruction set and caching.** Intermediate Concepts + Lab 2. Deliberately break and fix instruction ordering; measure rebuild times before/after. Milestone: you can explain layer caching from memory, with numbers.

**Week 3 — Multi-service local development.** Production Usage's Compose example + Lab 3. Build a real app + Postgres + Redis stack with correct healthchecks and a named volume. Milestone: prove data survives a restart and is wiped by "down -v" on purpose.

**Week 4 — Multi-stage builds and security hardening.** Advanced Concepts + Security sections + Lab 4. Convert an image to multi-stage, drop to non-root, run a CVE scan, fix findings. Milestone: a before/after image-size and CVE-count table you could show in an interview.

**Week 5 — Internals and debugging fluency.** Internal Working, Architecture, Data Flow sections. Deliberately break a container (bad port binding, OOM, missing env var) and practice the docker logs -> inspect -> exec -> stats escalation path until it's reflexive. Milestone: diagnose a planted failure in under 5 minutes.

**Week 6 — Production deployment thinking.** Deployment, Production Checklist, Scalability sections. Write a full production Dockerfile with justification comments for every line (as in this page's Deployment section) for a real project. Milestone: a Dockerfile you'd be comfortable defending line-by-line to a senior reviewer.

Then continue to **Kubernetes** on this platform — everything here is the prerequisite for orchestrating containers at scale, and to the **CI/CD**/**GitHub Actions** skills to automate the build-scan-push-deploy pipeline this page describes by hand.
`,

  "official-docs": `
- [Docker documentation](https://docs.docker.com/) — the reference; the "Guides" and "Build" sections are consistently well-written.
- [Dockerfile reference](https://docs.docker.com/reference/dockerfile/) — precise semantics for every instruction, including edge cases like ARG/ENV interaction.
- [Docker Compose file reference](https://docs.docker.com/reference/compose-file/) — the full compose.yml schema.
- [BuildKit documentation](https://docs.docker.com/build/buildkit/) — cache mounts, multi-platform builds, the modern build engine.
- [Open Container Initiative specs](https://opencontainers.org/) — the actual image and runtime format standard underlying Docker (and every OCI-compatible tool).
- [Docker security documentation](https://docs.docker.com/engine/security/) — rootless mode, capabilities, seccomp/AppArmor defaults.
- [Moby project](https://github.com/moby/moby) — the open-source project Docker Engine is built from.
`,

  books: `
- **Docker Deep Dive** — Nigel Poulton. The clearest, most consistently updated single book on Docker specifically; a strong first read cover to cover.
- **Docker in Action, 2nd ed.** — Jeff Nickoloff & Stephen Kuenzli. Hands-on, example-heavy, good for solidifying the CLI and Dockerfile mechanics.
- **The Docker Book** — James Turnbull. An accessible early-stage overview still useful for the conceptual grounding, though check version-specific commands against current docs.
- **Kubernetes Up & Running, 3rd ed.** — Burns, Beda, Hightower. Read once Docker feels solid — the natural next step into orchestration, and clarifies exactly where Docker's job ends and Kubernetes's begins.
- **Container Security** — Liz Rice. Focused specifically on the namespaces/cgroups/capabilities security model this page's Security section summarizes — the deep-dive version.
- **Cloud Native DevOps with Kubernetes** — Arundel & Domingus. Broader context for how containers fit into a full production deployment pipeline.
`,

  blogs: `
- **Docker's own engineering blog** (docker.com/blog) — release notes, BuildKit features, security advisories straight from the source.
- **Liz Rice's writing and talks** — consistently the clearest voice on container security internals (namespaces, capabilities, seccomp).
- **The Kubernetes blog** (kubernetes.io/blog) — highly relevant once you cross into orchestration; frequently covers the containerd/CRI boundary this page touches on.
- **Julia Evans' blog** (jvns.ca) — accessible, technically deep explainers on Linux internals (namespaces, syscalls) that underpin containers.
- **The Cloud Native Computing Foundation (CNCF) blog** — containerd, OCI, and the broader ecosystem's governance and roadmap.
- **AWS/Azure/GCP container-service blogs** — for the "where containers actually run in production" side; see the AWS/Azure/GCP skills for the platform-specific detail.
`,

  "research-papers": `
Docker itself is more an engineering achievement (standardizing existing kernel primitives into a usable product) than the subject of foundational academic papers — the honest reading here leans toward systems papers on the underlying primitives and adjacent research, plus a note on where academic coverage is thin:

- **"Namespaces in operation" (LWN series, Michael Kerrisk)** — not a formal paper, but the closest thing to a rigorous, citable reference on Linux namespaces; read this before anything else if you want ground-truth detail.
- **"cgroups" kernel documentation and design notes** (kernel.org Documentation/cgroup-v2.rst) — the closest primary-source reference for how resource limiting actually works.
- **"An Updated Performance Comparison of Virtual Machines and Linux Containers"** (Felter et al., IBM Research, 2015) — a genuinely empirical paper measuring container vs VM overhead; useful for grounding the "containers are faster/lighter" claim in actual numbers rather than folklore.
- **"Borg, Omega, and Kubernetes"** (Burns et al., ACM Queue, 2016) — not about Docker specifically, but the foundational paper on Google's container-orchestration lineage that directly shaped Kubernetes; essential context for why orchestration exists as a separate problem from Docker itself.
- If you are looking for a formal, peer-reviewed paper specifically about "Docker" as a system, the honest answer is that coverage is thin — Docker is primarily documented through its own engineering blog, conference talks, and the OCI specification rather than academic venues. The closest foundational academic reading is the Felter et al. VM-vs-container performance paper above, plus the Linux namespaces/cgroups kernel documentation as primary sources for the mechanisms Docker builds on.
`,

  videos: `
- **Nigel Poulton — Docker and Kubernetes courses/talks** — consistently clear, up-to-date walkthroughs from the author of Docker Deep Dive.
- **Liz Rice — "What Happens When You Run a Container?" and container security talks (various KubeCon/DockerCon years)** — live-builds a minimal container from raw Linux syscalls on stage, the best possible way to internalize namespaces/cgroups viscerally.
- **Jérôme Petazzoni — early Docker internals talks (DockerCon)** — from a founding Docker engineer, still one of the clearest explanations of the underlying mechanics.
- **Bret Fisher — Docker Mastery and Docker Compose deep-dive content** — practical, example-driven, strong for the Compose and production-tooling side.
- **TechWorld with Nana — Docker and Kubernetes tutorial series** — a widely used, well-structured beginner-to-intermediate path.
- **DockerCon and KubeCon/CloudNativeCon talk archives (YouTube)** — search for the specific year/topic; these are where the ecosystem's own engineers explain new features first.
`,

  "github-repos": `
- [moby/moby](https://github.com/moby/moby) — the open-source project Docker Engine is built from; read the docs/ directory for design rationale.
- [opencontainers/runc](https://github.com/opencontainers/runc) — the reference OCI runtime; genuinely readable Go source for how namespaces/cgroups get wired up.
- [containerd/containerd](https://github.com/containerd/containerd) — the container lifecycle daemon underneath both Docker and Kubernetes.
- [docker/awesome-compose](https://github.com/docker/awesome-compose) — real, working docker-compose.yml examples for dozens of stacks (a great pattern library beyond this page's single example).
- [hadolint/hadolint](https://github.com/hadolint/hadolint) — a Dockerfile linter; run it against your own Dockerfiles to catch anti-patterns automatically.
- [aquasecurity/trivy](https://github.com/aquasecurity/trivy) — the CVE image-scanning tool referenced throughout this page's Security/Deployment sections.
- [GoogleContainerTools/distroless](https://github.com/GoogleContainerTools/distroless) — the minimal base images referenced in Advanced Concepts.
- [wagoodman/dive](https://github.com/wagoodman/dive) — an interactive tool for exploring an image's layers and finding bloat, a hands-on companion to "docker history".
- [docker/genai-stack](https://github.com/docker/genai-stack) — Docker's own reference architecture for containerized AI application stacks, directly relevant to AI-engineering use cases.
`,

  "practice-problems": `
**Ordered by skill focus:**

1. *Instruction fluency*: containerize five small, different apps (a static site with nginx, a Python script, a Node API, a Go binary, a cron-like scheduled task) — each teaches a different base-image and CMD/ENTRYPOINT shape.
2. *Layer caching*: given a Dockerfile, predict on paper which layers rebuild after a specific file change, then verify with "docker build" timing and "docker history".
3. *Multi-stage builds*: take any single-stage Dockerfile you've written and convert it to multi-stage, measuring the image-size reduction with "docker images".
4. *Networking*: set up three Compose services where only two should be able to reach each other — use separate user-defined networks to enforce it, and verify with "docker exec ... curl" that the isolation actually holds.
5. *Persistence*: build a stack where a database's data survives "docker compose down" but is destroyed by "docker compose down -v" — verify both behaviors explicitly.
6. *Security hardening*: take a container running as root with no HEALTHCHECK and no resource limits, and harden it fully (non-root USER, HEALTHCHECK, memory/CPU limits, dropped capabilities) — verify each change with "docker inspect".
7. *Debugging under pressure*: have a colleague (or your future self) deliberately break a container (bad env var, wrong bind address, OOM-inducing memory limit) without telling you which, and time how fast you can diagnose it using only docker logs/inspect/exec/stats.

External sets: Docker's own "Get Started" and "Build" guided labs (docs.docker.com), Katacoda-style interactive Docker scenarios (where still available), and the "Play with Docker" browser sandbox for risk-free experimentation.
`,

  "architecture-diagram": `
The reference production architecture for a containerized AI/web service — the shape this page's examples build toward:

~~~mermaid
flowchart TB
    Dev["Developer"] -->|git push| CI["CI/CD pipeline\n(GitHub Actions)"]
    CI -->|docker build + scan| Reg[("Container registry\nECR / GCR / ACR")]
    Reg -->|pull| Orch["Orchestrator\n(Kubernetes / ECS / Cloud Run)"]

    subgraph Cluster["Production cluster"]
        Orch --> Pod1["App container 1\n(non-root, resource-limited)"]
        Orch --> Pod2["App container 2"]
        Orch --> PodN["App container N"]
        Pod1 & Pod2 & PodN --> DB[("Managed Postgres\n(RDS/Cloud SQL/Azure DB)")]
        Pod1 & Pod2 & PodN --> Cache[("Managed Redis\n(ElastiCache/Memorystore)")]
    end

    LB["Load balancer / ingress"] --> Pod1
    LB --> Pod2
    LB --> PodN
    Users["End users"] --> LB

    subgraph Obs["Observability"]
        Metrics["Prometheus/Grafana"]
        Logs["Centralized logs\n(Loki/ELK/cloud logging)"]
        Health["Liveness/readiness probes"]
    end
    Pod1 -.metrics/logs/health.-> Obs
    Pod2 -.metrics/logs/health.-> Obs
    PodN -.metrics/logs/health.-> Obs
~~~

Every box past "Container registry" has its own dedicated skill page on this platform (Kubernetes, AWS/Azure/GCP, Observability topics) — this diagram is the map of how Docker's output (the image) connects into the rest of a production system.
`,

  "mind-map": `
~~~mermaid
mindmap
  root((Docker))
    Core concepts
      Namespaces (isolation)
      cgroups (resource limits)
      Union filesystem (overlayfs)
      Image vs container
    Dockerfile
      FROM WORKDIR COPY RUN
      ENV vs ARG
      CMD vs ENTRYPOINT
      USER · EXPOSE · HEALTHCHECK
      Layer caching order
      Multi-stage builds
    Internals
      dockerd -> containerd -> shim -> runc
      OCI image spec
      Content-addressed layers
    Local dev
      Docker Compose
      Volumes vs bind mounts
      Networking modes
    Production
      Registries and tagging
      Non-root and minimal images
      Resource limits and healthchecks
      CI/CD build-scan-push-deploy
    Security
      Shared-kernel attack surface
      Capabilities and privileged mode
      Secrets never baked into images
      Image scanning (CVEs)
    Ecosystem
      Kubernetes (orchestration)
      AWS/Azure/GCP (where it runs)
      Podman / containerd (alternatives)
    Career
      Interview classics: container vs VM
      Hands-on labs
      Reading path to Kubernetes
~~~
`,
};

export default docker;
