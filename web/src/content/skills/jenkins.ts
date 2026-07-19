import type { SkillContent } from "../types";

/**
 * Jenkins — full 50-section knowledge page.
 * Note: code blocks use ~~~ fences (CommonMark-equivalent to backtick fences)
 * so this file needs no backtick escaping inside the template literals.
 * Groovy/Jenkinsfile string interpolation (the dollar-brace GString syntax)
 * is described in prose or shown via string concatenation instead of the
 * literal interpolation sequence, per the platform's authoring contract.
 */
const jenkins: SkillContent = {
  overview: `
Jenkins is a self-hosted, open-source automation server that runs the build, test, and deploy pipelines behind an enormous share of the world's software delivery. It is the original popular implementation of what the industry now calls CI/CD: every time code is pushed, Jenkins can check it out, compile it, run the test suite, build an artifact or container image, and push that artifact toward a deployment target — all without a human touching a keyboard.

For an AI engineer, Jenkins matters less as "the tool you'll choose for a greenfield project" and more as "the tool you will absolutely meet inside a large enterprise." Banks, insurers, telecoms, defense contractors, and any company with an on-premises data center or air-gapped network almost always run Jenkins, because it is the one CI system that does not require sending your source code or build logs to a third-party SaaS platform. If you build ML training pipelines, model-serving deployments, or data pipelines inside a regulated enterprise, there is a good chance the orchestration layer that triggers your jobs is Jenkins, not GitHub Actions or GitLab CI.

Key characteristics: Jenkins is a Java application (distributed as a WAR file or a container image) that you install and operate yourself — on a VM, a Kubernetes cluster, or bare metal. It has a controller (formerly called "master") that schedules and coordinates work, and one or more agents (formerly "slaves" or "nodes") that actually execute builds. Its defining trait is an enormous plugin ecosystem — well over 1,800 plugins covering every source control system, cloud provider, notification channel, and build tool imaginable — which is simultaneously Jenkins' greatest strength (nothing it cannot eventually be made to do) and its most cited operational weakness (plugin compatibility, security patching, and abandoned plugins are a genuine, ongoing maintenance burden).

Jenkins pipelines are typically defined as code in a file called a Jenkinsfile, checked into the same repository as the application it builds. This "Pipeline as Code" model — which Jenkins pioneered and popularized before GitHub Actions or GitLab CI existed — means your build logic is versioned, reviewed, and branched exactly like your application code. Understanding Jenkins deeply gives you a mental model that transfers directly to every other CI/CD system: controller/agent scheduling maps to GitHub Actions' hosted-runner model, the Jenkinsfile maps to a GitHub Actions workflow YAML file, and Jenkins Shared Libraries map to GitHub Actions reusable workflows. See the **CI/CD** skill for the vendor-neutral concepts (pipelines, stages, artifacts, triggers) that every one of these tools implements differently.
`,

  history: `
Jenkins began life as **Hudson**, created by **Kohsuke Kawaguchi**, a Sun Microsystems engineer, in 2004. Kawaguchi was frustrated with the manual, error-prone process of building and testing Java projects and wrote Hudson as a personal side project to automate his own team's builds. It was released as open source in 2005 and quickly became one of the most popular continuous integration servers in the Java ecosystem, thanks to its plugin architecture and a genuinely usable web UI at a time when most CI tooling was command-line-only or proprietary.

The pivotal event in Jenkins' history was the 2010–2011 dispute between the Hudson community and Oracle, which had acquired Sun. Oracle wanted tighter control over the Hudson trademark and infrastructure than the community was comfortable with. The majority of contributors, led by Kawaguchi, forked the project, renamed it Jenkins, and took the community, the plugin ecosystem, and almost all future development with them. Oracle continued a much smaller Hudson project (later donated to the Eclipse Foundation) that is effectively dead today. This fork is a well-known case study in open-source governance: a healthy community with a permissive license and a portable trademark strategy survived a hostile corporate acquisition attempt largely intact.

| Year | Milestone |
|------|-----------|
| 2004 | Kohsuke Kawaguchi starts the project at Sun Microsystems, originally called Hudson |
| 2005 | Hudson released as open source |
| 2008–2010 | Rapid plugin ecosystem growth; becomes the dominant Java-world CI server |
| 2011 | Oracle/community dispute over trademark and governance; the project forks and is renamed **Jenkins** |
| 2011 | Jenkins wins the community, contributors, and almost all plugin development going forward |
| 2016 | Pipeline plugin matures; **Jenkinsfile** and Pipeline-as-Code become the recommended way to define jobs |
| 2016 | **Declarative Pipeline** syntax introduced as a more structured, opinionated layer on top of the older Scripted Pipeline |
| 2018 | **Blue Ocean** UI released, a modernized visual pipeline editor and run visualizer |
| 2019 | Jenkins governance formalized under the **Continuous Delivery Foundation** (part of the Linux Foundation) |
| 2020s | Cloud-native competitors (GitHub Actions, GitLab CI, CircleCI) capture most new/greenfield CI adoption; Jenkins remains dominant in large existing enterprise estates and regulated/on-prem environments |
| Ongoing | Kubernetes-based dynamic agents (via the Kubernetes plugin) become the standard way to run modern Jenkins agent fleets, rather than static long-lived VMs |

The lesson for engineers: Jenkins' longevity is not an accident of inertia alone. It is a direct consequence of decisions made in 2011 (community-controlled governance, a durable plugin API) that let it keep absorbing new build tools, cloud providers, and container technologies for over a decade without needing a rewrite.
`,

  "why-it-exists": `
Before Hudson/Jenkins, "continuous integration" existed as a practice (Martin Fowler and the Extreme Programming community had already described it) but the tooling was primitive: CruiseControl (XML-configured, clunky UI, Java-only mindset), cron jobs calling shell scripts, or simply nothing — many teams built and tested manually on a developer's machine before a release.

The gap Jenkins (as Hudson) filled:

1. **A usable web UI for build automation.** CruiseControl and its contemporaries required hand-editing XML and offered minimal visibility into build history. Hudson gave you a browser-based dashboard showing build status, history, console output, and trends with almost no configuration.
2. **A plugin architecture instead of a monolith.** Rather than the core project trying to support every version control system, build tool, and notification channel itself, Hudson exposed a plugin API. Anyone could write a plugin for a new SCM, a new artifact repository, or a new test framework, and it would appear in Hudson's UI like a first-class feature. This is the single design decision most responsible for Jenkins' later dominance.
3. **Self-hosted control.** In 2004–2011, "send your source code to someone else's server to build it" was not an option most enterprises would even consider — cloud CI as a SaaS product barely existed. Hudson/Jenkins let a team run their own build server inside their own network, under their own security policy.
4. **Distributed builds.** Even early versions supported a master coordinating multiple build agents, so a single team could parallelize builds across several machines instead of queuing on one box.

The world before Jenkins was one where continuous integration was a discipline evangelists talked about at conferences, but most teams either didn't practice it or hand-rolled brittle shell-script automation. Jenkins made CI something an average team could adopt in an afternoon.
`,

  "problem-it-solves": `
Jenkins removes concrete, everyday pains:

- **Manual build-and-test toil.** Without CI, someone has to remember to pull the latest code, install dependencies, run the test suite, and eyeball the results before every release. Jenkins does this automatically on every commit, every pull request, or on a schedule.
- **"Works on my machine."** A build agent with a known, reproducible environment (increasingly a container) removes the class of bugs caused by one developer's laptop having a slightly different toolchain than another's.
- **Slow feedback loops.** A broken build is caught in minutes, not discovered days later during a release, because Jenkins runs the pipeline on every push and can notify the team immediately (see post-build actions in the worked example below).
- **Deployment as a manual, risky ritual.** Jenkins pipelines can drive the actual deployment step too — building a Docker image, pushing it to a registry, and triggering a rollout — turning "deploy day" into a routine, repeatable pipeline run.
- **Fragmented, one-off automation scripts.** Instead of every team inventing its own build scripts, Jenkins gives an organization one place to define, schedule, secure, and audit build/deploy automation across hundreds of projects.

What Jenkins deliberately does **not** solve, and where teams should not expect it to help:

- **It is not a source control system** — it consumes Git (or SVN, Perforce, etc.); see the **Git** skill for the versioning layer underneath every Jenkins job.
- **It is not a container orchestrator** — it can drive Kubernetes deployments via plugins or kubectl calls inside a pipeline stage, but it does not run your production workloads; see the **Kubernetes** skill.
- **It is not a secrets vault** — the Credentials plugin stores and injects secrets safely into pipelines, but for enterprise-grade secret lifecycle management (rotation, dynamic leasing, audit) teams typically integrate a dedicated secrets manager (see the **Secrets Management** skill) rather than treating Jenkins' credential store as the source of truth.
- **It is not free of operational cost.** Unlike a hosted SaaS CI, Jenkins is software you must patch, scale, back up, and secure yourself — that operational burden is the central tradeoff explored throughout this page.
`,

  "learning-objectives": `
By the end of this page you should be able to:

1. Explain the controller/agent architecture and design an agent fleet with labels for workload isolation.
2. Write a Declarative Pipeline Jenkinsfile with checkout, build, test, Docker build/push, and deploy stages, plus post-build notifications.
3. Explain the difference between Declarative and Scripted Pipeline syntax and justify when each is appropriate.
4. Safely inject credentials into a pipeline using the Credentials plugin without leaking secrets into build logs.
5. Route jobs to specific agents using labels, and explain why workload isolation matters at scale.
6. Evaluate a plugin before installing it, and describe the operational risks of Jenkins' plugin ecosystem (version compatibility, security patching, abandonment).
7. Write and consume a Jenkins Shared Library to reuse pipeline logic across many repositories.
8. Debug a failing or hung Jenkins build using the console log, agent logs, and the Script Console.
9. Compare Jenkins honestly against GitHub Actions and GitLab CI and articulate when a team should still choose Jenkins.
10. Harden a Jenkins controller against the most common real-world attack surface (Script Console RCE, unauthenticated access, unpatched plugins, credential leakage).
`,

  prerequisites: `
- **Required**: comfort with the command line, a basic understanding of what CI/CD means conceptually (build → test → deploy), and familiarity with Git (clone, branch, push). See the **Git** skill if any of this is new.
- **Required**: basic Groovy or any C-like scripting language syntax helps for Scripted Pipeline and Shared Libraries, but Declarative Pipeline (the recommended default) can be learned from this page with zero prior Groovy knowledge.
- **Helpful**: Docker fundamentals (images, containers, registries) — see the **Docker** skill — since almost every modern Jenkinsfile builds and pushes a container image.
- **Helpful**: basic Linux administration (users, permissions, systemd/services) if you will be installing and operating a Jenkins controller yourself rather than using one someone else manages.
- **Helpful**: a general CI/CD vocabulary (stages, artifacts, triggers, matrix builds) from the **CI/CD** skill, since this page assumes you know what those words mean and focuses on how Jenkins specifically implements them.

Dependency links: **Git** (source of truth) → **Jenkins** (orchestration) → **Docker** (build agents, artifacts) → **Kubernetes** / **AWS** / **Azure** / **GCP** (deployment targets). If you are choosing your first CI tool for a new project with no legacy constraints, read this page alongside **GitHub Actions** and **CI/CD** before deciding.
`,

  "beginner-concepts": `
### What a "job" is

The most basic unit of work in Jenkins is a **job** (also called a project). Historically, jobs were configured entirely through the web UI ("Freestyle projects") — you would click through forms to say "pull this repo, run this shell command, archive this file." Freestyle jobs still exist and are fine for a single, simple, one-off task, but virtually all real work today should be defined as a **Pipeline job**, whose logic lives in a Jenkinsfile instead of scattered across UI form fields.

### Installing and starting Jenkins

~~~bash
# Quickest way to try Jenkins locally: the official container image
docker run -d --name jenkins \\
  -p 8080:8080 -p 50000:50000 \\
  -v jenkins_home:/var/jenkins_home \\
  jenkins/jenkins:lts

# First login: retrieve the auto-generated admin password
docker exec jenkins cat /var/jenkins_home/secrets/initialAdminPassword
~~~

Port 8080 serves the web UI; port 50000 is used for agents that connect back to the controller over the JNLP/inbound TCP protocol. The jenkins_home volume holds all configuration, job definitions, plugins, and build history — treat it as the thing you back up.

### Your first Jenkinsfile

A Jenkinsfile is a text file, usually named exactly "Jenkinsfile", committed at the root of your repository. Jenkins reads it and executes the pipeline it describes.

~~~groovy
pipeline {
    agent any   // run on any available agent

    stages {
        stage('Hello') {
            steps {
                echo 'Hello from Jenkins'
                sh 'uname -a'   // sh runs a shell step on the agent
            }
        }
    }
}
~~~

Creating a "Pipeline" job in the UI and pointing it at a repository containing this file is enough to get a working, versioned build.

### Stages and steps

A pipeline is built from **stages** (logical phases like Build, Test, Deploy — shown as columns in the UI) each containing **steps** (individual commands, like "sh" to run a shell command or "checkout" to pull source code). This maps directly to the generic CI/CD vocabulary of stages and jobs covered in the **CI/CD** skill — Jenkins just gives it a specific syntax.

### Triggers: how a build starts

~~~groovy
pipeline {
    agent any
    triggers {
        // Poll the SCM for changes every 5 minutes (legacy approach)
        pollSCM('H/5 * * * *')
        // Better in modern setups: a webhook from your Git host pushes
        // straight to Jenkins the instant a commit lands (near-instant,
        // no polling overhead). Configured on the SCM side + the
        // "GitHub hook trigger for GITScm polling" option in the job.
    }
    stages {
        stage('Build') {
            steps { sh './build.sh' }
        }
    }
}
~~~

Polling was the only option in early Jenkins and is still used in networks where the Git server cannot reach out to Jenkins (common in air-gapped enterprise setups). Webhooks are strictly better when network access allows them — no wasted polling cycles, and builds start in seconds instead of minutes. See the **Git** skill for how webhooks are configured on the repository side.

### The build history and console output

Every run of a job produces a numbered **build** with a full console log, a pass/fail status, and (if configured) archived artifacts and test reports. This is the first place to look when a pipeline fails — read it top to bottom, but the actual error is almost always near the bottom, right before the failure marker.
`,

  "intermediate-concepts": `
### Declarative Pipeline: the recommended default

Declarative Pipeline is a structured, opinionated syntax layered on top of Jenkins' underlying Groovy pipeline engine. It trades some flexibility for readability, built-in validation, and a syntax that is far easier for a whole team to maintain consistently.

~~~groovy
pipeline {
    agent { label 'linux && docker' }   // route to an agent with these labels

    options {
        timeout(time: 30, unit: 'MINUTES')   // kill runaway builds
        timestamps()                          // timestamp every log line
        disableConcurrentBuilds()             // one run of this job at a time
    }

    environment {
        // Environment variables available to every stage
        APP_NAME = 'orders-service'
    }

    parameters {
        // Adds a UI form field; use as params.DEPLOY_ENV in stages
        choice(name: 'DEPLOY_ENV', choices: ['staging', 'production'], description: 'Target environment')
    }

    stages {
        stage('Build') {
            steps {
                sh 'make build'
            }
        }
        stage('Test') {
            steps {
                sh 'make test'
            }
            post {
                always {
                    junit 'reports/**/*.xml'   // publish test results even on failure
                }
            }
        }
    }

    post {
        failure {
            echo 'Build failed - see notifications section for real alerting'
        }
    }
}
~~~

### Scripted Pipeline: the older, more powerful escape hatch

Scripted Pipeline is raw Groovy wrapped in a single "node" block. It predates Declarative Pipeline and gives you the full power of the Groovy language — arbitrary loops, conditionals, and functions — with no structural guardrails.

~~~groovy
node('linux') {
    stage('Build') {
        sh 'make build'
    }
    stage('Test') {
        try {
            sh 'make test'
        } catch (err) {
            currentBuild.result = 'UNSTABLE'
            echo "Tests failed but continuing: " + err.getMessage()
        }
    }
}
~~~

### Why Declarative is now the recommended default

Declarative Pipeline is preferred for the majority of teams today because:

- It has a **fixed, validated structure** — Jenkins can lint a Declarative Jenkinsfile before running it, catching typos and structural mistakes early. Scripted pipelines are only checked by actually running the Groovy.
- It reads the same way across every team, because the syntax is constrained. Scripted pipelines tend to accumulate ad-hoc Groovy idioms that only their original author fully understands.
- Common needs (timeouts, retries, parameters, post-build conditions, agent selection) are first-class keywords, not something you write yourself in Groovy every time.
- You can still drop into arbitrary Groovy from inside a Declarative pipeline using a "script { }" block when you genuinely need a loop or a conditional the declarative syntax doesn't cover — so you rarely lose real power, only unnecessary freedom.

Scripted Pipeline remains the right choice when a pipeline's control flow is genuinely too dynamic for Declarative's structure — for example, a Shared Library that needs to programmatically generate a variable number of parallel stages from a list computed at runtime.

### Credentials: using secrets safely

~~~groovy
pipeline {
    agent any
    stages {
        stage('Push image') {
            steps {
                // withCredentials injects the secret only for this block,
                // and Jenkins actively masks the value in console output
                // wherever it can detect it being printed.
                withCredentials([usernamePassword(
                    credentialsId: 'dockerhub-creds',
                    usernameVariable: 'REG_USER',
                    passwordVariable: 'REG_PASS'
                )]) {
                    sh 'echo REG_PASS | docker login -u REG_USER --password-stdin'
                }
            }
        }
    }
}
~~~

Never echo a credential variable directly (for example "echo REG_PASS") — Jenkins masks known patterns, but explicit printing, string concatenation into unrelated variables, or writing secrets to a file that later gets archived as a build artifact can all leak them. Prefer piping secrets directly into the command that needs them, as above, over exporting them broadly. For enterprise-scale secret lifecycle (rotation, short-lived tokens, audit trails), pair Jenkins Credentials with a dedicated vault — see the **Secrets Management** skill.

### Agent labels: routing work

~~~groovy
pipeline {
    agent { label 'gpu && cuda12' }   // only run on agents advertising both labels
    stages {
        stage('Train') {
            steps { sh 'python train.py' }
        }
    }
}
~~~

Labels let you route jobs to agents with specific hardware or software (a GPU box for model training, a Windows agent for a .NET build, an agent with a specific compliance certification for regulated workloads) without hardcoding a specific machine name.
`,

  "advanced-concepts": `
### Shared Libraries: reusing pipeline logic across many Jenkinsfiles

At scale, an organization might have hundreds of repositories each with their own Jenkinsfile. Copy-pasting a 100-line pipeline into every repository is a maintenance nightmare — fixing a bug in the deploy logic means editing hundreds of files. **Shared Libraries** solve this the same way GitHub Actions' reusable workflows do: pipeline logic lives in one versioned repository and every Jenkinsfile calls into it.

A Shared Library repository has a conventional structure:

~~~text
(shared-library-repo)/
├── vars/
│   └── standardBuild.groovy    # a "global variable" callable as a pipeline step
├── src/
│   └── org/company/Deployer.groovy   # ordinary Groovy classes
└── resources/
    └── org/company/deploy-template.yaml
~~~

~~~groovy
// vars/standardBuild.groovy
def call(Map config) {
    pipeline {
        agent { label config.agentLabel ?: 'linux' }
        stages {
            stage('Build') { steps { sh config.buildCmd } }
            stage('Test')  { steps { sh config.testCmd } }
        }
    }
}
~~~

Every application's Jenkinsfile then shrinks to a few lines:

~~~groovy
@Library('company-shared-library@v2.3.0') _
standardBuild(agentLabel: 'linux && docker', buildCmd: 'make build', testCmd: 'make test')
~~~

The at-sign version tag pins the library to a specific release, so a change to the shared library does not silently break every consuming pipeline at once — teams upgrade deliberately, exactly like bumping a dependency version. This is a senior/staff-level pattern: it turns "our build process" into a product with its own versioning, tests, and changelog, rather than folklore copy-pasted between repositories.

### The controller/agent execution model in depth

The controller schedules work but, in a properly configured production Jenkins, should not execute build steps itself — the controller's job is orchestration (queueing, scheduling, UI, plugin logic, tracking build state), not running "make build" or "docker push" directly. Running builds on the controller ("built-in node") is a common beginner mistake that causes resource contention, security exposure (a compromised build could reach controller-only secrets), and scaling ceilings. Production Jenkins pins agent { label ... } explicitly (or uses cloud-based dynamic agents, see below) and disables scheduling on the built-in node entirely.

### Dynamic agents on Kubernetes

Static, always-on VM agents waste resources when idle and require manual capacity planning. The Kubernetes plugin lets Jenkins provision a fresh agent pod on demand for each build, matched to a pod template (image, resource limits, labels), and tear it down afterward.

~~~groovy
pipeline {
    agent {
        kubernetes {
            yaml '''
apiVersion: v1
kind: Pod
spec:
  containers:
  - name: builder
    image: maven:3.9-eclipse-temurin-17
    command: ["sleep"]
    args: ["99999"]
'''
        }
    }
    stages {
        stage('Build') {
            steps {
                container('builder') { sh 'mvn -B verify' }
            }
        }
    }
}
~~~

This is the modern replacement for a static fleet of long-lived agent VMs: every build gets a clean, ephemeral, exactly-versioned environment, and idle capacity costs nothing. See the **Kubernetes** and **Docker** skills for the container fundamentals this depends on.

### Parallel stages and matrix builds

~~~groovy
pipeline {
    agent any
    stages {
        stage('Cross-platform tests') {
            matrix {
                axes {
                    axis { name: 'PLATFORM'; values 'linux', 'windows', 'macos' }
                    axis { name: 'PY_VERSION'; values '3.11', '3.12' }
                }
                stages {
                    stage('Test') {
                        steps { sh 'run-tests.sh' }
                    }
                }
            }
        }
    }
}
~~~

The matrix directive expands into one parallel stage per combination of axis values (here, 6 combinations), each scheduled independently across the agent fleet — the direct analog of a matrix strategy in GitHub Actions.

### Concurrency, locking, and idempotency

Two builds of the same job triggered close together can race — for example, both trying to deploy to the same environment simultaneously. disableConcurrentBuilds() serializes an entire job; the lock step (from the Lockable Resources plugin) is more surgical, letting you serialize just one critical section (like "deploy to staging") while other stages still run in parallel across builds.

### Restart from a stage and pipeline resumption

Long pipelines that fail partway through do not have to be re-run from scratch — Jenkins can restart from a specific failed stage (via "Restart from Stage" in the Blue Ocean UI or classic UI), and Declarative Pipeline durability settings control how much state survives a controller restart mid-build, trading some performance for resilience against controller crashes.
`,

  "internal-working": `
Understanding what actually happens between a Git push and a running build clarifies almost every debugging and scaling decision in Jenkins.

~~~mermaid
flowchart TB
    A["Git push / PR event"] --> B{"Trigger mechanism"}
    B -->|"Webhook (preferred)"| C["Controller receives HTTP callback"]
    B -->|"SCM polling (legacy/air-gapped)"| C
    C --> D["Controller: job definition loaded,\nJenkinsfile parsed"]
    D --> E["Controller: build queued"]
    E --> F{"Scheduler picks an agent\nmatching required labels"}
    F --> G["Agent connects/spins up\n(static VM or dynamic K8s pod)"]
    G --> H["Agent: workspace checked out"]
    H --> I["Agent executes pipeline steps\n(sh, docker build, test runners)"]
    I --> J["Agent streams console log\nback to controller"]
    J --> K["Controller: build result recorded,\nartifacts/test reports archived"]
    K --> L["post { } block: notifications,\ncleanup, downstream triggers"]
~~~

Step by step:

1. **Trigger**: a webhook from your Git host (see the **Git** skill) hits the controller's HTTP endpoint, or the controller polls the repository on a schedule. Webhooks are near-instant; polling has latency equal to the poll interval and wastes network/CPU cycles checking for "no change" most of the time.
2. **Parse**: the controller reads the Jenkinsfile (from source control — this is "Pipeline as Code," not a UI-stored config) and builds an internal representation of stages and steps.
3. **Queue and schedule**: the build enters a queue. The controller's scheduler looks at each stage's agent requirement (a label expression like "linux && docker") and assigns the build to a matching, available agent — this is functionally identical to a Kubernetes scheduler matching pod requests to node capacity.
4. **Agent execution**: the actual shell commands, Docker builds, and test runs execute on the agent machine (or ephemeral pod), never on the controller in a correctly configured setup. The agent has its own filesystem workspace, checked out fresh (or reused, depending on configuration) for this build.
5. **Streaming feedback**: console output streams back to the controller over the agent connection (traditionally JNLP/inbound TCP on port 50000, or SSH) so you can watch a build live in the UI.
6. **Completion and post-processing**: the controller records the final status, archives artifacts and test reports the pipeline told it to keep, and runs the post block — notifications, cleanup steps, or triggering downstream jobs.

The critical mental model: **the controller is a scheduler and record-keeper; the agent is where your code actually runs.** Every performance, security, and scaling decision in this page follows from keeping that separation clean.
`,

  architecture: `
### Controller/agent (master/worker) architecture

~~~mermaid
flowchart TB
    subgraph Controller["Jenkins Controller"]
        UI["Web UI / REST API"]
        Sched["Scheduler & queue"]
        Plugins["Plugin subsystem"]
        ConfigStore["Job configs, credentials store,\nbuild history (jenkins_home)"]
    end
    subgraph Agents["Agent fleet"]
        A1["Static VM agent\nlabel: linux"]
        A2["Static VM agent\nlabel: windows"]
        A3["Dynamic K8s pod agent\nlabel: gpu, spun up on demand"]
    end
    Controller -->|assigns build by label match| A1
    Controller -->|assigns build by label match| A2
    Controller -->|provisions pod, assigns build| A3
    A1 -->|console log, artifacts| Controller
    A2 -->|console log, artifacts| Controller
    A3 -->|console log, artifacts| Controller
    A3 -.torn down after build.-> Agents
~~~

Distributing build agents matters for two independent reasons that are easy to conflate:

1. **Scale**: a single machine can only run so many builds concurrently. Adding agents adds throughput, exactly like adding worker nodes to any queue-based system.
2. **Workload isolation**: different builds need genuinely different environments — a GPU box for model training, a Windows machine for a .NET build, an agent inside a specific network segment for a compliance-restricted deployment, or simply "an environment that cannot be contaminated by another team's build." Labels let the scheduler route work to the right kind of machine, and running builds on isolated agents (rather than the shared controller) also limits the blast radius if a build is compromised or misbehaves.

### Application architecture: how a mature team structures Jenkins around a codebase

~~~text
platform-repo/                     # one repo per application (or monorepo module)
├── Jenkinsfile                    # Declarative Pipeline: checkout/build/test/deploy
├── Dockerfile
└── src/

shared-jenkins-library/            # separate repo, versioned independently
├── vars/                          # reusable pipeline steps (standardBuild, deployToK8s)
├── src/                           # supporting Groovy classes
└── resources/                     # templates (K8s manifests, notification templates)

jenkins-infra/                     # Jenkins-as-code for the controller itself
├── casc/                          # Configuration as Code (JCasC) YAML: security realm,
│                                  # agent clouds, global credentials, plugin list
├── plugins.txt                    # pinned plugin versions installed at startup
└── agents/
    └── pod-templates/             # Kubernetes pod templates for dynamic agents
~~~

Mature Jenkins estates treat the **controller itself as code** (Configuration as Code / JCasC) rather than a hand-clicked snowflake — the controller's security settings, credential definitions (references, not secret values), and agent cloud configuration are stored in YAML and applied at startup, so a controller can be rebuilt reproducibly rather than being an irreplaceable pet server.
`,

  "data-flow": `
Tracing one webhook-triggered pipeline run end to end, through controller scheduling to an agent executing the pipeline:

~~~mermaid
sequenceDiagram
    participant Dev as Developer
    participant Git as Git host (webhook)
    participant Ctrl as Jenkins Controller
    participant Sched as Scheduler/Queue
    participant Agent as Build Agent
    participant Reg as Container Registry
    participant Deploy as Deploy target (K8s/cloud)

    Dev->>Git: git push
    Git->>Ctrl: webhook POST (push event)
    Ctrl->>Ctrl: match webhook to job, parse Jenkinsfile
    Ctrl->>Sched: enqueue build with required agent label
    Sched->>Agent: assign build (spin up pod if dynamic)
    Agent->>Git: checkout source at commit SHA
    Agent->>Agent: run build stage (compile/install deps)
    Agent->>Agent: run test stage, produce junit XML
    Agent->>Agent: docker build -t app:sha
    Agent->>Reg: docker push app:sha
    Agent->>Deploy: kubectl apply / deploy step
    Agent-->>Ctrl: stream console log + final status
    Ctrl->>Ctrl: archive artifacts, publish test report
    Ctrl->>Dev: post{} notification (Slack/email) with result
~~~

The step worth internalizing: the controller never runs your application code. It receives the webhook, decides which job and which agent, and afterward only receives a status update and streamed logs. Every byte of "real work" — checkout, compile, test, image build, deploy — happens on the agent. This is precisely why a compromised or overloaded agent should never have controller-level credentials or access, and why scaling Jenkins is fundamentally about scaling the agent fleet, not the controller.
`,

  "production-usage": `
### How real teams run Jenkins

- **Controller**: usually one Jenkins controller per team or per business unit (rarely one giant shared controller for an entire company, since that becomes a single point of failure and a security blast-radius risk). Run as a container or dedicated VM, with jenkins_home on persistent, backed-up storage.
- **Configuration as Code (JCasC)**: security realm, authorization strategy, agent clouds, and global tool configuration defined in YAML and loaded at controller startup, so the controller can be destroyed and recreated without losing its setup (only jenkins_home's job history/credentials need restoring from backup).
- **Plugin pinning**: a plugins.txt (or plugins.yaml) file lists exact plugin versions, installed at image build time — never "whatever's latest" in production, since plugin updates are the single most common cause of a broken Jenkins controller.
- **Agents as pods**: the Kubernetes plugin provisions a fresh, ephemeral agent pod per build from a versioned pod template — this has become the standard over maintaining a static fleet of long-lived VM agents, because it eliminates configuration drift between agents and scales elastically with load.
- **One Jenkinsfile per repository**, calling into a shared library for anything reused across more than one or two repos.
- **Backup**: jenkins_home (job configs, build history, credentials store, plugin state) is backed up on a schedule (e.g., via the ThinBackup plugin or an external volume snapshot) — losing it without a backup means losing your entire CI history and configuration.

### Typical project layout for the Jenkinsfile itself

~~~groovy
pipeline {
    agent { label 'linux && docker' }
    options { timeout(time: 45, unit: 'MINUTES') }
    environment {
        IMAGE = 'registry.company.com/orders-service'
    }
    stages {
        stage('Checkout') {
            steps { checkout scm }
        }
        stage('Build') {
            steps { sh './gradlew build -x test' }
        }
        stage('Test') {
            steps { sh './gradlew test' }
            post { always { junit '**/build/test-results/**/*.xml' } }
        }
        stage('Docker build') {
            steps { sh "docker build -t IMAGE:GIT_COMMIT ." }
        }
        stage('Docker push') {
            steps {
                withCredentials([usernamePassword(credentialsId: 'registry-creds',
                        usernameVariable: 'U', passwordVariable: 'P')]) {
                    sh 'echo P | docker login registry.company.com -u U --password-stdin'
                    sh "docker push IMAGE:GIT_COMMIT"
                }
            }
        }
        stage('Deploy') {
            when { branch 'main' }
            steps {
                sh "kubectl set image deployment/orders-service app=IMAGE:GIT_COMMIT"
            }
        }
    }
    post {
        success { echo 'Pipeline succeeded' }
        failure { echo 'Pipeline failed - notify the team here' }
    }
}
~~~

(Note: variable references above are written without the literal Groovy interpolation syntax purely for this page's formatting rules — in a real Jenkinsfile you would use GString interpolation or the string.plus concatenation form to embed IMAGE and env.GIT_COMMIT into the shell command strings.)
`,

  "industry-examples": `
- **Netflix**: has published extensively on running Jenkins at very large scale internally, building custom plugins and tooling (including early open-source contributions like the Job DSL ecosystem influence) to manage thousands of jobs across a huge microservice estate.
- **LinkedIn**: has run large internal Jenkins deployments for build and release automation across its Java-heavy service estate, historically a heavy investor in Jenkins plugin development.
- **Financial services and banks (widely, not always named publicly)**: Jenkins remains extremely common in regulated financial institutions because it can run entirely inside a bank's own data center or private cloud, satisfying regulatory and audit requirements that forbid sending source code or build artifacts to third-party SaaS CI providers.
- **Government and defense contractors**: air-gapped or classified network environments frequently standardize on Jenkins because it is one of the few mature CI systems that can run with zero external network dependency, including offline plugin installation.
- **Telecoms and large legacy enterprises**: organizations with decades of accumulated Java/.NET applications and existing Jenkins investment (custom plugins, shared libraries, hundreds of configured jobs) rarely migrate wholesale to a newer CI system, since the migration cost of hundreds of pipelines and integrations is far larger than any per-build convenience a newer tool offers.
- **CloudBees**: the company founded by much of the original Jenkins core team, offering a commercially supported Jenkins distribution (CloudBees CI) plus hosted/managed Jenkins options — itself evidence of continued large enterprise demand for supported, self-hosted Jenkins.

The pattern across these examples: Jenkins persists wherever self-hosting, air-gapping, regulatory control, or an existing multi-year investment in jobs and plugins outweighs the operational convenience of a managed SaaS CI product.
`,

  "best-practices": `
1. **Always define pipelines as code (Jenkinsfile) checked into the repository** — never rely on UI-configured Freestyle jobs for anything beyond a quick throwaway task; UI config isn't versioned, reviewed, or reproducible.
2. **Prefer Declarative Pipeline by default**; reach for Scripted Pipeline or a script{} block only when control flow genuinely requires it.
3. **Never build on the controller.** Pin agent { label ... } explicitly and disable executors on the built-in node in production.
4. **Pin plugin versions** in a plugins.txt/plugins.yaml applied at controller build time; never let plugins auto-update untested in production.
5. **Use Configuration as Code (JCasC)** for the controller's own setup so it is reproducible and disaster-recoverable, not a hand-configured snowflake.
6. **Inject credentials via withCredentials, never as plain environment variables** exposed globally, and never echo them to the console log.
7. **Prefer webhooks over SCM polling** whenever the network topology allows it — faster feedback, less wasted load on the controller.
8. **Move to dynamic (Kubernetes) agents** rather than maintaining long-lived static VM agents, for elastic scaling and to eliminate agent configuration drift.
9. **Extract shared logic into a Shared Library** once the same pipeline block is copy-pasted into a third Jenkinsfile — treat the library like a real dependency with its own version tags and tests.
10. **Set timeouts on every pipeline** (options { timeout(...) }) so a hung step cannot occupy an agent indefinitely.
11. **Archive test reports and artifacts explicitly** (junit, archiveArtifacts) so failures are diagnosable from the UI without re-running the build.
12. **Back up jenkins_home on a schedule** and periodically rehearse restoring it — an untested backup is not a backup.
`,

  "anti-patterns": `
### Building directly on the controller

~~~groovy
// WRONG: no agent label — may schedule onto the controller/built-in node
pipeline {
    agent any
    stages { stage('Build') { steps { sh 'make build' } } }
}

// RIGHT: explicit label routes work to a real agent, never the controller
pipeline {
    agent { label 'linux && docker' }
    stages { stage('Build') { steps { sh 'make build' } } }
}
~~~

Running arbitrary build steps on the controller wastes the one resource every job depends on (the scheduler/UI process) and expands the security blast radius of any compromised build.

### Printing or exporting secrets carelessly

~~~groovy
// WRONG: secret ends up in plain env, easy to leak via env | sort, or a debug echo
environment {
    DB_PASSWORD = credentials('db-password')
}
steps { sh 'env' }   // leaks DB_PASSWORD to the console log

// RIGHT: scope the credential to only the step that needs it
steps {
    withCredentials([string(credentialsId: 'db-password', variable: 'DB_PASSWORD')]) {
        sh 'run-migration.sh'   // migration script reads DB_PASSWORD itself
    }
}
~~~

### Installing plugins without a compatibility plan

~~~text
WRONG: clicking "install" on every plugin that looks useful, with auto-update
       enabled, directly on a production controller.
RIGHT: pin exact plugin versions in plugins.txt, test upgrades in a staging
       controller first, and review a plugin's last-commit date and open
       issue count before adopting it (see Security and Best Practices).
~~~

### Copy-pasting the same 100-line Jenkinsfile into every repository

Once the same block of stages appears in three or more repositories, it should become a Shared Library call. Copy-paste pipelines mean a bug fix or security patch has to be applied N times, and it never is applied consistently in practice.

### Using Scripted Pipeline by default "because it's more powerful"

Reaching for Scripted Pipeline's unrestricted Groovy for every job produces pipelines only their author can safely modify. Default to Declarative; use a script{} block for the rare, genuinely dynamic piece of logic.

### No timeouts, ever

A stuck step (a hung network call, an interactive prompt a script didn't expect) with no timeout occupies an agent executor forever, silently shrinking your build capacity until someone notices queued builds.
`,

  performance: `
### Measure first

~~~bash
# Controller health and thread activity
curl -s http://jenkins.internal/monitoring       # Monitoring plugin metrics endpoint
# Or use the built-in Support Core plugin's thread dump / support bundle
# for diagnosing a slow or hung controller.
~~~

Watch the built-in **/load-statistics** and executor utilization graphs first — most Jenkins performance problems are queue depth (not enough agent capacity) or controller CPU/heap pressure (too much work, including builds, running on the controller itself), not something exotic.

### The optimization hierarchy (apply in order)

1. **Stop building on the controller.** This alone resolves the majority of "Jenkins feels slow" complaints — move all execution to agents and keep the built-in node's executor count at zero.
2. **Add agent capacity, or make agents ephemeral (Kubernetes).** If the queue is consistently backed up, you need more concurrent executors, not a faster controller.
3. **Cache dependencies on agents.** Cold dependency downloads (Maven/Gradle/npm/pip caches) on every ephemeral pod can dominate build time; mount a persistent cache volume or use a build-tool-level remote cache.
4. **Parallelize independent stages** (parallel { } blocks, or matrix for combinatorial test grids) rather than running everything serially.
5. **Reduce checkout cost** with shallow clones (depth: 1) when full history isn't needed, and reuse workspaces where safe instead of a fresh full checkout every build.
6. **Right-size the controller's JVM heap** and monitor garbage collection pauses — a controller managing thousands of jobs and a large build history needs real capacity planning, not defaults.
7. **Trim plugin count.** Every installed plugin adds startup time, memory footprint, and background thread activity to the controller even when idle — audit and remove unused plugins periodically.

### Concrete levers

- Poll-based triggers cost the controller a scan cycle per job per interval even when nothing changed — switching to webhooks removes this entirely.
- Archiving huge artifacts on every build bloats jenkins_home and slows controller disk I/O; archive only what's needed, and prefer pushing large artifacts to a dedicated artifact repository (Nexus/Artifactory/S3) instead.
- Excessive build history retention (thousands of kept builds per job) slows the UI and disk usage; configure discard-old-builds policies per job.
`,

  scalability: `
Jenkins scales primarily by scaling the **agent fleet**, not the controller — the controller is intentionally a single coordinating process (high-availability controller setups exist but are complex and comparatively rare versus simply scaling agents).

~~~mermaid
flowchart LR
    Ctrl["Jenkins Controller\n(single coordinating process)"] --> Q["Build queue"]
    Q --> A1["Static agent pool\n(fixed capacity)"]
    Q --> A2["Kubernetes dynamic agents\n(elastic, scale with demand)"]
    Q --> A3["Cloud agent plugins\n(EC2, Azure VM, GCE - spin up/down)"]
~~~

### Vertical vs horizontal

- **Vertical**: give the controller more CPU/RAM/disk so it can track more jobs, more concurrent builds' metadata, and more plugins comfortably. This has a ceiling — the controller is still one process handling scheduling and UI for everything.
- **Horizontal**: add more agents (static or, preferably, dynamic Kubernetes pods) to run more builds concurrently. This is where nearly all of Jenkins' real scaling headroom lives.

### Bottleneck table

| Bottleneck | Answer |
|------------|--------|
| Build queue backing up | Add agent capacity; move to elastic Kubernetes agents that scale with demand |
| Controller CPU/heap pressure | Stop scheduling builds on the controller; reduce plugin count; increase heap; consider a second controller for a different team/business unit |
| One giant shared controller becomes a blast-radius/availability risk | Split into multiple controllers per team/business unit, coordinated via shared libraries and infra-as-code rather than one shared instance |
| Slow builds from cold dependency caches on ephemeral agents | Persistent cache volumes, or a remote build cache at the tool level |
| Disk growth on the controller (build history, archived artifacts) | Discard-old-builds policies; push large artifacts to Nexus/Artifactory/S3 instead of Jenkins' own storage |
| Single point of failure (one controller) | Regular jenkins_home backups; some organizations run active/passive HA controller setups (more common in CloudBees' commercial offering) |

Multi-controller setups (one controller per team, or per major product line) are a common horizontal scaling strategy at large organizations — trading a single "Jenkins for everything" instance for many smaller, independently owned, independently upgradable controllers coordinated by shared libraries and shared infra-as-code, rather than a shared runtime.
`,

  security: `
### Jenkins-specific attack surface

1. **The Script Console is remote code execution by design.** Any user with Script Console access (Manage Jenkins > Script Console) can run arbitrary Groovy with the controller's own permissions — this is an administrative feature, not a bug, but it means access to it must be restricted as tightly as root SSH access to the controller host.
2. **Unauthenticated or weakly authenticated controllers.** A Jenkins instance exposed to the internet with anonymous read/build permissions (a shockingly common misconfiguration found by security researchers over the years) lets an attacker read source code, secrets, and often achieve RCE via the Script Console or a vulnerable plugin. Always put Jenkins behind real authentication (SSO/LDAP/OIDC) and a network boundary (VPN, internal network, or a reverse proxy with access control).
3. **Plugin vulnerabilities.** Because plugins run with the controller's own privileges, a vulnerable or malicious plugin is equivalent to a vulnerability in Jenkins core itself. Jenkins' own security advisories regularly cover plugin CVEs (path traversal, XXE, CSRF, credential exposure). Subscribe to the Jenkins Security Advisories and patch promptly, especially plugins touching credentials or SCM.
4. **Credential leakage in build logs.** Secrets echoed accidentally, written to an archived artifact, or exposed via a debug flag in a build tool are the most common real-world Jenkins credential leaks — see the Anti-Patterns section.
5. **Build agents with excessive trust.** An agent that can read controller-level credentials it does not need turns "one compromised build dependency" into "full CI system compromise." Scope credentials to the specific jobs that need them, not globally.
6. **Pipeline script approval / sandboxing.** Scripted Pipeline and script{} blocks run inside a Groovy sandbox by default for non-administrators, but certain Groovy constructs require an administrator to explicitly approve them (Manage Jenkins > In-process Script Approval) — never blanket-approve everything without reviewing what is actually being approved, since sandbox escapes are a known plugin/Jenkins vulnerability class.

### Defenses, concretely

- Enforce **role-based authorization** (Role-based Authorization Strategy plugin or Matrix Authorization) so most users can trigger and view builds but cannot reach administrative functions like the Script Console or plugin management.
- **Scope credentials to folders/jobs** rather than defining everything as a global credential available to every pipeline in the instance.
- Run agents with **no unnecessary access** to the controller's credential store, and prefer ephemeral, disposable Kubernetes agents that leave no residual state after a build.
- Keep Jenkins core and all plugins current, subscribed to security advisories, and test upgrades in a non-production controller first given the real risk of plugin breakage.
- Put the controller behind TLS and a reverse proxy; never expose the raw Jenkins port directly to the internet.

See the **Secrets Management**, **OWASP Top 10**, and **CI/CD Security** skills for defense-in-depth patterns that apply to any CI system, not just Jenkins.
`,

  testing: `
Jenkins pipelines themselves should be treated as code that deserves testing, and pipelines should also drive your application's own test suite.

### Testing the application via the pipeline

~~~groovy
stage('Test') {
    steps {
        sh './gradlew test jacocoTestReport'
    }
    post {
        always {
            junit '**/build/test-results/test/*.xml'          // fail/pass counts, trends
            publishHTML(target: [reportDir: 'build/reports/jacoco', reportFiles: 'index.html', reportName: 'Coverage'])
        }
    }
}
~~~

junit publishes structured test results Jenkins can trend over time and surface per-test failure history in the UI — always wire this into a post { always { } } block so results publish even when the test stage itself fails.

### Testing pipeline (Jenkinsfile) logic itself

Shared Library code (ordinary Groovy classes under src/) can be unit tested with the **JenkinsPipelineUnit** framework, which mocks the pipeline DSL steps so you can assert on pipeline logic without spinning up a real Jenkins controller:

~~~groovy
// Using JenkinsPipelineUnit (Spock/JUnit-based test for a shared library method)
class StandardBuildSpec extends BasePipelineTest {
    def "standardBuild runs the configured build command"() {
        when:
        def script = loadScript('vars/standardBuild.groovy')
        script.call([buildCmd: 'make build', testCmd: 'make test'])

        then:
        assertJobStatusSuccess()
        assert helper.callStack.findAll { it.methodName == 'sh' }.size() == 2
    }
}
~~~

### Senior testing doctrine for Jenkins

- Validate Declarative Jenkinsfile syntax before a real run using the **Jenkinsfile Linter** (a REST endpoint the controller exposes, callable from a pre-commit hook or IDE plugin) — catches structural errors in seconds instead of waiting for a full build to fail on step one.
- Treat a Shared Library like any other library: unit test it, tag releases, and never let a change to shared/company-wide pipeline logic go untested given how many repositories depend on it.
- Run a staging Jenkins controller for testing plugin upgrades and JCasC configuration changes before applying them to the production controller.
- For the application code itself, Jenkins is only the runner — the actual testing doctrine (unit vs integration, fixtures, coverage targets) belongs to that application's own language/framework, not to Jenkins.
`,

  debugging: `
### The toolbox, in escalation order

1. **Read the console log, from the bottom up first, then the top.** The final error is usually near the end, but the real root cause (a bad checkout, a missing environment variable) is often several lines earlier than where the pipeline actually aborts.
2. **Check "Pipeline Steps" / "Replay"** in the build's UI page — Replay lets you edit the Jenkinsfile inline and re-run the exact same build without committing a new change, invaluable for iterating on a broken pipeline quickly.
3. **Blue Ocean's visual pipeline view** highlights exactly which stage failed at a glance, faster than scrolling a long classic-UI console log for a pipeline with many stages.
4. **Check the agent, not just the controller.** If a build hangs or fails mysteriously, inspect the specific agent it ran on — is it out of disk space, missing a tool, or was the pod evicted (common with under-resourced Kubernetes agent pods)?

~~~text
# Common agent-side checks
df -h                      # disk space on the agent
docker ps -a                # did the build's own containers leave zombies?
kubectl describe pod <agent-pod>   # for K8s dynamic agents: was it OOMKilled/evicted?
~~~

5. **Script Console** (Manage Jenkins > Script Console), for administrators only: run raw Groovy against the controller's live state to inspect queue internals, cancel stuck builds, or query plugin state. Because this is effectively unrestricted code execution on the controller, treat every command here as production-dangerous and restrict access tightly.

~~~groovy
// Example: cancel all currently queued builds for a specific job (Script Console)
Jenkins.instance.queue.items.findAll { it.task.name == 'my-stuck-job' }.each {
    Jenkins.instance.queue.cancel(it.task)
}
~~~

6. **Thread dump / support bundle** (Manage Jenkins > System Information, or the Support Core plugin) when the controller itself feels frozen or unresponsive — shows exactly what every controller thread is doing.
7. **Pipeline syntax validator** (the /pipeline-syntax/ URL on your controller) to interactively generate correct step syntax and catch Declarative structure errors before committing.

### Common "why is my pipeline stuck" causes

- No agent matches the requested label (typo in the label expression, or the labeled agents are all offline/busy) — the build queues forever with a visible "waiting for next available executor" message.
- A step is genuinely blocked (waiting on network I/O with no timeout) — add options { timeout(...) } so this fails loudly instead of silently occupying an executor.
- The controller itself is under memory/CPU pressure and the UI/scheduler are simply slow to respond — check controller resource graphs, not the specific job.
`,

  monitoring: `
Production Jenkins visibility rests on watching both the controller's health and each pipeline's outcomes.

### Controller health metrics

The **Metrics plugin** (or Prometheus plugin) exposes controller internals in a scrapeable format:

~~~groovy
// Prometheus plugin exposes /prometheus with metrics such as:
// jenkins_queue_size_value              — builds waiting for an executor
// jenkins_executor_count_value          — total executors across the fleet
// jenkins_executor_in_use_value         — currently busy executors
// jenkins_node_offline                  — per-agent up/down status
// jvm_memory_used_bytes                 — controller JVM heap pressure
~~~

Alert on: sustained queue depth greater than zero (means you are executor-starved), a rising ratio of offline agents, and controller JVM heap consistently near its ceiling.

### Per-pipeline observability

- **junit** and **publishHTML** steps surface test pass/fail trends and coverage directly in each job's UI history — watch for flaky-test patterns (intermittent failures on the same test) as a leading indicator of a fragile suite.
- **Build duration trends** (built into the classic UI's trend graph) catch a pipeline that's silently getting slower over months, often from unbounded workspace/cache growth.
- **currentBuild.result** and post{} blocks are the hook point for shipping build outcome events to an external system (Slack, PagerDuty, a company dashboard) rather than relying on anyone actually watching the Jenkins UI.

### Notifications wired into post{}

~~~groovy
post {
    success {
        slackSend(channel: '#builds', color: 'good',
                  message: "Build succeeded: JOB_NAME #BUILD_NUMBER")
    }
    failure {
        slackSend(channel: '#builds', color: 'danger',
                  message: "Build FAILED: JOB_NAME #BUILD_NUMBER - see BUILD_URL")
        emailext(to: 'team@company.com', subject: 'Build failed',
                 body: 'See console output for details.')
    }
    unstable {
        slackSend(channel: '#builds', color: 'warning',
                  message: "Build unstable (tests failing): JOB_NAME #BUILD_NUMBER")
    }
}
~~~

(As with the earlier worked example, the JOB_NAME/BUILD_NUMBER/BUILD_URL values above are Jenkins pipeline environment variables you would normally interpolate into the message string using Groovy's standard GString syntax.)

### What to actually watch, ranked

1. Queue depth and executor utilization (are we capacity-constrained?).
2. Per-job success rate and duration trend (is a specific pipeline degrading?).
3. Agent fleet health (offline agents, pod eviction/OOM rates for Kubernetes agents).
4. Controller JVM heap and GC pause time (is the controller itself healthy?).
`,

  deployment: `
### Running the Jenkins controller itself in production

~~~dockerfile
FROM jenkins/jenkins:lts-jdk17

# Pin exact plugin versions - never rely on "latest" in production
COPY plugins.txt /usr/share/jenkins/ref/plugins.txt
RUN jenkins-plugin-cli --plugin-file /usr/share/jenkins/ref/plugins.txt

# Configuration as Code: controller security realm, agent clouds, and
# global tool config are defined declaratively and applied at startup,
# so the controller can be rebuilt reproducibly from source control.
COPY jenkins.yaml /var/jenkins_home/casc_configs/jenkins.yaml
ENV CASC_JENKINS_CONFIG=/var/jenkins_home/casc_configs/jenkins.yaml

# Non-default JVM sizing for a controller managing many jobs - tune per instance
ENV JAVA_OPTS="-Xmx4g -Xms2g -Djenkins.install.runSetupWizard=false"

EXPOSE 8080 50000
~~~

Why each choice matters: pinning plugin versions in plugins.txt at image-build time (rather than clicking "install" in the running UI) makes the controller's plugin set reproducible and reviewable in a pull request; JCasC means the controller's own configuration is version-controlled instead of a hand-clicked snowflake; explicit JVM heap sizing avoids the default heap being wrong for your job/history volume; disabling the setup wizard lets the image boot straight into a working, pre-configured state suitable for automated provisioning.

### Agent deployment: dynamic Kubernetes agents (the modern default)

~~~yaml
# Kubernetes plugin pod template (referenced from a Jenkinsfile's
# agent { kubernetes { yaml ... } } block, or configured globally via JCasC)
apiVersion: v1
kind: Pod
spec:
  containers:
    - name: builder
      image: docker.io/library/maven:3.9-eclipse-temurin-17
      resources:
        requests: { cpu: "500m", memory: "1Gi" }
        limits:   { cpu: "2",    memory: "4Gi" }
      command: ["sleep"]
      args: ["99999"]     # keep the container alive; Jenkins injects commands via exec
~~~

Resource requests/limits matter here exactly as they do for any Kubernetes workload — an agent pod with no memory limit can starve the node it lands on; one with too tight a limit gets OOMKilled mid-build. See the **Kubernetes** and **Docker** skills for the container fundamentals this depends on.

### CI/CD pipeline for Jenkins itself

Treat Jenkins infrastructure like any other production service: changes to jenkins.yaml (JCasC) or plugins.txt should go through a pull request, apply to a staging controller first, and only then roll to production — "test your CI system's changes the way you test your application's changes" is a rule many teams learn only after a bad plugin upgrade takes down their build pipeline for a day.
`,

  "production-checklist": `
Before a Jenkins controller takes real production traffic (i.e., real team pipelines):

- [ ] Controller runs behind TLS and a reverse proxy; never exposed raw on the internet
- [ ] Real authentication configured (LDAP/SSO/OIDC), anonymous read/build access disabled
- [ ] Role-based authorization in place; Script Console restricted to administrators only
- [ ] Plugin versions pinned in plugins.txt/plugins.yaml; no auto-update in production
- [ ] Controller configuration defined via JCasC (Configuration as Code), not hand-clicked
- [ ] Executors disabled on the built-in/controller node; all builds routed to labeled agents
- [ ] Dynamic (Kubernetes) or well-maintained static agent fleet with defined labels
- [ ] Credentials scoped to the folders/jobs that need them, never all global
- [ ] Every pipeline has options { timeout(...) } set
- [ ] Webhooks configured from source control where network topology allows (not blind polling)
- [ ] Test results (junit) and artifacts explicitly published in post{ always { } } blocks
- [ ] Notifications (Slack/email) wired into post{ success/failure/unstable { } }
- [ ] jenkins_home backed up on a schedule, with a tested restore procedure
- [ ] Security advisories subscription in place; patch cadence defined for core + plugins
- [ ] Build history / artifact retention policies set per job to bound disk growth
- [ ] Staging controller exists for testing plugin upgrades and JCasC changes before production
`,

  "common-mistakes": `
1. **Running builds on the controller** — because "agent any" was left unlabeled and the built-in node still has executors enabled; starves the scheduler and expands security blast radius.
2. **Letting plugins auto-update in production** — a routine plugin update is one of the most common causes of a Jenkins controller breaking overnight with no application code change involved.
3. **Global credentials everywhere** — defining every secret at the global scope instead of folder/job scope means any pipeline in the instance can read any secret, turning one compromised job into a full-credential-store leak.
4. **No timeout on any stage** — a single hung network call or interactive prompt occupies an executor indefinitely, silently reducing build capacity.
5. **Copy-pasted Jenkinsfiles across dozens of repos** instead of a Shared Library — a security fix or logic change then has to be manually reapplied everywhere, and rarely is, consistently.
6. **Treating the Jenkins UI as the source of truth** for job configuration instead of the Jenkinsfile — UI-only Freestyle jobs are unreviewable, unversioned, and irreproducible.
7. **Ignoring Jenkins Security Advisories** — Jenkins core and plugin CVEs are published regularly; an unpatched, internet-reachable controller is a realistic attack target, not a theoretical one.
8. **SCM polling everywhere instead of webhooks** when the network allows webhooks — wastes controller cycles and adds minutes of unnecessary latency to every build trigger.
9. **No backup of jenkins_home**, or a backup nobody has ever tested restoring — the controller's entire job history, configuration, and credential store live there.
10. **Choosing Scripted Pipeline by default** for its extra flexibility, producing pipelines only their original author can safely modify, instead of defaulting to Declarative and reaching for script{} only when truly needed.
`,

  "common-errors": `
| Error | Typical cause | Fix |
|-------|---------------|-----|
| "There are no nodes with the label X" | No agent currently advertises the requested label, or all matching agents are offline/busy | Check agent labels under Manage Jenkins > Nodes; add capacity or fix the label expression |
| Build queued forever, never starts | Executor starvation, or a Kubernetes agent cloud failing to provision pods | Check queue reasons in the UI; inspect Kubernetes plugin cloud logs / kubectl events |
| Secret appears in plain text in console log | Credential exported broadly instead of scoped with withCredentials, or explicitly echoed | Scope the credential to the minimal step; never print credential variables |
| "Scripts not permitted to use ..." (Script Security) | A Scripted Pipeline/script{} block calls a Groovy method requiring administrator approval | Review and approve in Manage Jenkins > In-process Script Approval, or rewrite to avoid the sandboxed call |
| Pipeline fails immediately with a syntax error | Malformed Declarative Pipeline (missing brace, wrong block nesting) | Use the /pipeline-syntax/ validator or Jenkinsfile Linter before committing |
| Agent connection drops mid-build | Network instability between controller and agent, or an ephemeral Kubernetes pod evicted/OOMKilled | Check pod resource limits and node pressure; check agent connection logs |
| Docker-in-Docker permission or socket errors during "Docker build" stage | Agent lacks Docker socket access, or the agent container isn't privileged/configured for DinD | Mount the Docker socket correctly or use a Kaniko/Buildah-based agent instead of DinD |
| Plugin fails to load after upgrade, controller stuck at startup | Incompatible plugin version combination | Roll back to the pinned known-good plugins.txt; test upgrades on staging first |
| Build works locally but fails only in Jenkins | Environment difference between the developer's machine and the agent (missing tool, different version) | Pin exact tool versions in the agent image/pod template; avoid relying on ambient PATH state |

The habit that matters: check the build's full console log and the specific agent's state before assuming the pipeline logic itself is wrong — a large share of "mysterious" Jenkins failures are actually agent/infrastructure issues, not Jenkinsfile bugs.
`,

  faqs: `
**Q: Is Jenkins dead / obsolete now that GitHub Actions and GitLab CI exist?**
No. Jenkins remains one of the most widely deployed CI systems in the world, especially inside large enterprises with on-premises, air-gapped, or heavily regulated environments where self-hosted control is a hard requirement, not a preference. New, cloud-native, greenfield projects increasingly default to GitHub Actions or GitLab CI, but Jenkins' installed base is enormous and not going away soon.

**Q: Should I choose Jenkins for a brand-new project with no legacy constraints?**
Usually not, if you're already on GitHub or GitLab and have no air-gapped/on-prem/regulatory requirement — GitHub Actions or GitLab CI will need far less operational overhead (no controller to patch, secure, and scale yourself). Choose Jenkins when you specifically need self-hosted control, a huge existing plugin/integration surface, or you must run entirely disconnected from the internet.

**Q: Declarative or Scripted Pipeline?**
Declarative by default; it's more structured, easier to review, and validated before running. Reach for Scripted Pipeline (or a script{} block inside Declarative) only when control flow is genuinely too dynamic for Declarative's fixed structure.

**Q: How do I avoid the plugin compatibility hell everyone talks about?**
Pin exact plugin versions in a plugins.txt applied at controller-image-build time, test upgrades on a staging controller first, and periodically prune plugins you no longer actually use — every installed plugin is a future compatibility and security liability, even an idle one.

**Q: How does Jenkins compare to GitHub Actions for a team already fully on GitHub?**
GitHub Actions integrates natively with GitHub (no webhook plumbing, no separate controller to run), has a large marketplace of reusable actions, and needs zero infrastructure management for hosted runners. Jenkins requires you to run and maintain the controller yourself but gives you complete control over data locality, agent hardware, and network isolation. See the Comparisons section for the full breakdown.

**Q: What's Blue Ocean, and should I use it?**
Blue Ocean is Jenkins' modernized UI, focused on a clean visual pipeline view (stages as a left-to-right flow diagram) instead of the classic UI's more utilitarian layout. It is genuinely nicer for understanding a complex multi-stage pipeline at a glance, though as of this writing Blue Ocean's active development has slowed considerably compared to Jenkins core; check the current plugin status before committing to it as your team's primary UI.

**Q: Do I need a Shared Library for a small team with 3 repositories?**
Not necessarily — the overhead of maintaining a separate versioned library repository only pays off once you're duplicating meaningful pipeline logic across roughly three or more Jenkinsfiles. Below that, a small amount of duplication is simpler than premature abstraction.
`,

  "interview-questions": `
**Junior/Mid:**

1. *What is a Jenkinsfile, and why check it into source control instead of configuring a job through the UI?* A Jenkinsfile defines a pipeline as versioned, reviewable code, checked out from the same repository it builds; UI-configured Freestyle jobs are not versioned, reviewed, or reproducible the same way.
2. *What's the difference between Declarative and Scripted Pipeline?* Declarative is a structured, validated, opinionated syntax (recommended default); Scripted is raw Groovy with a node{} block, offering unrestricted control flow at the cost of structure and readability.
3. *What is a controller and what is an agent?* The controller schedules and coordinates builds, hosts the UI, and stores configuration; agents are the machines (static VMs or ephemeral pods) that actually execute build steps. Production setups never run builds on the controller itself.
4. *How do you trigger a Jenkins build automatically on every push?* A webhook from the Git host calling Jenkins directly (preferred, near-instant), or SCM polling on a schedule (used when the network doesn't allow inbound webhooks, e.g. air-gapped setups).
5. *How do you use a secret in a pipeline without leaking it into the console log?* The Credentials plugin plus withCredentials, scoping the secret to only the step that needs it; never echo the variable or export it broadly.

**Senior:**

6. *Why is Jenkins' plugin ecosystem described as both its greatest strength and a real liability?* Strength: near-total coverage of every SCM, cloud, notification, and build tool imaginable, all integrated into one UI. Liability: plugins run with controller-level privileges, so a vulnerable or abandoned plugin is a real security and stability risk; plugin version compatibility across a large installed set is an ongoing operational burden that requires pinning versions and staged upgrade testing.
7. *Design a Jenkins setup for an organization with hundreds of repositories.* Multiple controllers split by team/business unit rather than one shared instance; JCasC for reproducible controller config; a Shared Library for common pipeline logic instead of copy-pasted Jenkinsfiles; dynamic Kubernetes agents for elastic scaling; credentials scoped per folder/job, not global.
8. *When would you genuinely still choose Jenkins over GitHub Actions or GitLab CI for a new project?* When the team needs self-hosted control (air-gapped network, strict data residency/regulatory requirements), a very specific plugin/integration not well supported elsewhere, or already has a large existing Jenkins investment (shared libraries, hundreds of configured jobs) that migration cost doesn't justify replacing.
9. *Explain the security risk of the Script Console and how you'd mitigate it.* It runs arbitrary Groovy with the controller's own privileges — effectively unrestricted RCE by design. Mitigate by restricting access to a small set of trusted administrators via role-based authorization, and treating any Script Console command as a production-risk action.
10. *How would you scale Jenkins to handle a 10x increase in build volume?* Scale the agent fleet, not the controller — move to dynamic Kubernetes agents that provision on demand, add agent capacity/labels for workload isolation, and consider splitting a single overloaded controller into multiple controllers per team if the controller itself (not just agent capacity) becomes the bottleneck.
11. *What is a Shared Library and when do you introduce one?* A separately versioned repository of reusable pipeline logic (vars/ global steps, src/ Groovy classes) referenced by a version tag from consuming Jenkinsfiles. Introduce one once meaningful pipeline logic is duplicated across roughly three or more repositories.
12. *How do you keep a Jenkins controller's configuration reproducible and disaster-recoverable?* Configuration as Code (JCasC) for security realm, agent clouds, and tool config; pinned plugins.txt; regular tested backups of jenkins_home for job history and credentials that JCasC doesn't capture.
`,

  "coding-questions": `
### 1. Write a Declarative Jenkinsfile stage that retries a flaky integration test up to 3 times before failing the build

~~~groovy
stage('Integration tests') {
    steps {
        retry(3) {
            sh './run-integration-tests.sh'
        }
    }
}
~~~

Discussion: retry() re-runs the entire step block on failure, up to the given count; combine with a short sleep between attempts (a small script wrapper, since retry itself has no built-in delay) if the flakiness is due to a transient dependency still starting up. Follow-up: how would you distinguish "genuinely broken test" from "flaky infra" in your retry logic? (Answer: tag flaky tests explicitly and quarantine them separately rather than blindly retrying everything, which can mask real regressions.)

### 2. Write a Shared Library "vars" step that standardizes Docker build-and-push across many repositories, accepting the image name and tag as parameters

~~~groovy
// vars/dockerBuildPush.groovy
def call(Map config) {
    def image = config.image
    def tag = config.tag ?: env.GIT_COMMIT
    sh "docker build -t " + image + ":" + tag + " ."
    withCredentials([usernamePassword(
        credentialsId: config.credentialsId ?: 'registry-creds',
        usernameVariable: 'REG_USER', passwordVariable: 'REG_PASS')]) {
        sh 'echo REG_PASS | docker login -u REG_USER --password-stdin'
        sh "docker push " + image + ":" + tag
    }
}
~~~

Usage from a consuming Jenkinsfile: dockerBuildPush(image: 'registry.company.com/orders-service'). Complexity/design discussion: string concatenation (rather than GString interpolation) is used deliberately here to avoid ambiguity with this page's formatting rules, but in real code GString interpolation is idiomatic and preferred for readability. Follow-up: how do you version this library so a breaking change doesn't silently break every consumer? (Answer: tag releases, e.g. @Library("company-lib@v3.0.0"), and require consumers to bump the tag deliberately.)

### 3. Diagnose: a pipeline stage that runs "kubectl apply" intermittently fails with a permissions error, but only on some builds

~~~groovy
stage('Deploy') {
    steps {
        // Bug: relies on ambient kubeconfig that may differ per agent/pod
        sh 'kubectl apply -f k8s/deployment.yaml'
    }
}

// Fix: make the kubeconfig/credential explicit and consistent per build,
// not dependent on whatever happens to be on the specific agent
stage('Deploy') {
    steps {
        withCredentials([file(credentialsId: 'k8s-kubeconfig', variable: 'KUBECONFIG')]) {
            sh 'kubectl apply -f k8s/deployment.yaml'
        }
    }
}
~~~

Root cause discussion: "intermittent" failures tied to which agent a build lands on are a classic symptom of environment drift between agents — one agent has a valid kubeconfig baked in, another doesn't. The fix makes the credential an explicit, controller-managed input rather than implicit agent state, which also makes the pipeline portable to a fresh ephemeral Kubernetes agent with no pre-baked configuration at all.
`,

  "hands-on-labs": `
### Lab 1 — Your first Declarative pipeline (beginner, ~1h)
Install Jenkins locally via Docker, create a Pipeline job pointed at a small sample repository, and write a Jenkinsfile with checkout, build, and test stages using "sh" steps. Deliverable: a green build with published junit test results. Skills exercised: controller setup, basic Declarative syntax, junit publishing.

### Lab 2 — Credentials and a Docker build/push pipeline (intermediate, ~2h)
Extend Lab 1's pipeline to build a Docker image and push it to a registry (a local registry container is fine), using the Credentials plugin and withCredentials so the registry password never appears in the console log. Deliverable: a pipeline that fails loudly if you deliberately try to echo the credential (to prove masking/scoping works), and succeeds when done correctly. Skills exercised: Credentials plugin, Docker build/push staging, secret hygiene.

### Lab 3 — Agent labels and a Kubernetes dynamic agent (advanced, ~3h)
Configure the Kubernetes plugin against a local (kind/minikube) cluster, define a pod template with a label, and modify a pipeline to run on that dynamic agent instead of the controller's built-in node. Deliverable: a build whose console log shows it executing inside a freshly provisioned, then torn-down, agent pod. Skills exercised: controller/agent architecture in practice, Kubernetes pod templates, workload isolation.

### Lab 4 — A Shared Library powering two repositories (production, ~4h)
Create a separate Shared Library repository with a vars/standardBuild.groovy step covering checkout/build/test/docker-push/deploy, version it with a Git tag, and consume it from two different sample-application repositories' Jenkinsfiles. Then deliberately introduce a breaking change to the library, bump the version tag, and update only one consumer — demonstrating that the other consumer is unaffected until it deliberately upgrades. Deliverable: two working pipelines pinned to different library versions, plus a short write-up of the versioning strategy. Skills exercised: Shared Libraries, pipeline reuse at scale, safe rollout of shared infrastructure changes.
`,

  "real-projects": `
Portfolio-grade projects (each maps to real enterprise Jenkins responsibilities):

1. **A reproducible Jenkins-as-code controller.** Build a Jenkins controller image with JCasC defining security realm, role-based authorization, and a Kubernetes agent cloud, plus a pinned plugins.txt. Deliverable: destroy the running controller container and recreate it from source control alone, proving the configuration is fully reproducible (job history/credentials restored separately from a backup). Demonstrates: Configuration as Code discipline, controller security setup, disaster-recovery thinking.

2. **A multi-stage Jenkinsfile with real deployment.** A pipeline covering checkout, build, test (with published junit results), Docker build/push to a real registry, and a deploy stage that updates a running Kubernetes deployment (kubectl set image), gated with a "when { branch 'main' }" condition and Slack notifications on success/failure. Demonstrates: the full production Jenkinsfile pattern covered in this page, end to end.

3. **A company-wide Shared Library with tests.** A versioned Shared Library covering standardized build, test, and deploy steps, unit tested with JenkinsPipelineUnit, consumed by at least two sample repositories pinned to different tagged versions, with a documented upgrade process. Demonstrates: reuse at scale, the senior-level pattern of treating pipeline logic as a real, versioned dependency rather than copy-pasted folklore.

Each project: Jenkinsfile and library code committed to source control, a README explaining the architecture and any security/credential decisions made, and — where relevant — a short honest comparison of what the same pipeline would look like in GitHub Actions, demonstrating you understand the tradeoffs rather than just one tool's syntax.
`,

  "case-studies": `
### Netflix: Jenkins at very large internal scale
Netflix has publicly discussed running Jenkins across a very large internal build/release estate, including building custom tooling and plugins to manage job creation and configuration at a scale where clicking through a UI for each job would be completely unworkable. Lesson: at real scale, Jenkins usage shifts from "configure jobs by hand" to "generate and manage jobs and pipelines programmatically" (Job DSL, Shared Libraries, JCasC) — the UI becomes an inspection tool, not the primary configuration interface.

### The Hudson/Jenkins fork: open governance as a survival strategy
When Oracle's control over the Hudson trademark and infrastructure clashed with the community's expectations after acquiring Sun, the majority of contributors forked the project to Jenkins under community governance, and Hudson subsequently withered while Jenkins became the dominant survivor. Lesson: a project's long-term health depends as much on its governance model and community trust as on its technical merits — a permissive license and a community that can credibly fork protected Jenkins' user base from a single vendor's decisions.

### A regulated-industry migration decision (illustrative pattern seen across banks/insurers)
Large regulated organizations that evaluate migrating from Jenkins to a SaaS CI product frequently stop the migration once they price out: re-writing hundreds of Jenkinsfiles and Shared Libraries, re-establishing equivalent air-gapped/on-prem controls, and re-training teams — versus the marginal convenience gained. Lesson: "objectively nicer developer experience elsewhere" does not automatically justify a migration when the switching cost of an entrenched CI system is measured in months of engineering time across hundreds of pipelines.

### CloudBees: a business built on Jenkins' enterprise gap
CloudBees, founded by much of Jenkins' original core team, built a commercial company around providing supported, hardened, enterprise-grade Jenkins distributions and managed offerings. Its continued existence and customer base is itself evidence that large enterprises want Jenkins' self-hosted flexibility with commercial support and hardening layered on top, rather than abandoning Jenkins outright for a SaaS alternative.
`,

  comparisons: `
| Dimension | Jenkins | GitHub Actions | GitLab CI | CircleCI |
|-----------|---------|-----------------|-----------|----------|
| Hosting model | Fully self-hosted (you run the controller) | SaaS-hosted (GitHub-managed runners) or self-hosted runners | SaaS-hosted or self-hosted runners | SaaS-hosted primarily |
| Config format | Jenkinsfile (Groovy-based Declarative or Scripted) | YAML workflow files | YAML (.gitlab-ci.yml) | YAML |
| Setup/maintenance burden | High — you patch, secure, and scale the controller yourself | Low — GitHub manages hosted runner infrastructure | Low for SaaS; higher if self-managing GitLab | Low |
| Air-gapped / on-prem support | Excellent — designed for it from the start | Possible via self-hosted runners, but the platform itself still assumes GitHub.com in most setups | Strong — GitLab itself can be fully self-hosted | Limited; primarily a SaaS product |
| Plugin/integration ecosystem | Enormous (1,800+ plugins), but variable quality and maintenance | Large marketplace of reusable Actions, generally higher average quality/maintenance | Built-in features cover most needs; smaller external ecosystem | Smaller ecosystem, curated orbs |
| Native SCM integration | Works with any SCM via plugins, but is a separate system from your Git host | Native, zero-config integration since it lives inside GitHub itself | Native, zero-config integration since it lives inside GitLab itself | Good GitHub/Bitbucket integration, still a separate system |
| Reusable pipeline logic | Shared Libraries (versioned Groovy repos) | Reusable/composite workflows and Actions | Includes/templates | Orbs |
| Best at | Regulated/on-prem/air-gapped environments, huge existing investment, maximum integration flexibility | Teams already fully on GitHub wanting minimal CI infrastructure overhead | Teams wanting an all-in-one self-hosted DevOps platform | Teams wanting a polished SaaS CI without GitLab/GitHub lock-in |

**How seniors choose**: if the organization requires self-hosted, air-gapped, or heavily regulated infrastructure, or already has a large working Jenkins estate (shared libraries, hundreds of jobs, institutional Groovy knowledge), Jenkins remains a genuinely correct choice, not merely a legacy holdover. For a greenfield project already living on GitHub with no such constraints, GitHub Actions usually wins on total operational simplicity — no controller to run, patch, or scale. GitLab CI is the natural choice for teams already standardized on GitLab, especially self-hosted GitLab. The honest senior answer to "Jenkins vs GitHub Actions" is rarely "one is universally better" — it is "which constraints (hosting, compliance, existing investment, ecosystem needs) dominate for this specific organization." See the **CI/CD** skill for the underlying concepts every one of these tools implements, and the **GitHub Actions** skill for the cloud-native alternative in depth.
`,

  "related-technologies": `
- **CI/CD** — the vendor-neutral concepts (pipelines, stages, triggers, artifacts) that Jenkins, GitHub Actions, and GitLab CI all implement differently; read this first if the general vocabulary is new.
- **GitHub Actions** — the modern cloud-native CI/CD alternative most tightly integrated with GitHub; read for an honest comparison of when to choose each.
- **Git** — the version control system Jenkins polls or receives webhooks from; understanding branching/webhooks here clarifies half of Jenkins' trigger behavior.
- **Docker** — almost every modern Jenkinsfile builds and pushes a container image, and containerized build agents are the modern default for Jenkins agent fleets.
- **Kubernetes** — the standard platform for running dynamic, ephemeral Jenkins agents at scale, and frequently the deployment target a Jenkins pipeline's final stage pushes to.
- **AWS / Azure / GCP** — common deployment targets for a Jenkins pipeline's deploy stage, and common hosts for the Jenkins controller itself (EC2, Azure VM, GCE, or managed Kubernetes).
- **Terraform** — frequently used to provision the Jenkins controller's own infrastructure and agent cloud resources as code, alongside JCasC for the application-level configuration.
- **Secrets Management** — pairs with Jenkins' built-in Credentials plugin for enterprise-grade secret lifecycle (rotation, dynamic leasing, audit) beyond what Jenkins stores natively.
- **Groovy** — the JVM scripting language underlying Scripted Pipeline and Shared Libraries; useful background if you'll write nontrivial pipeline logic.

On this platform, a natural learning path is: **Git** → **CI/CD** → **Jenkins** (or **GitHub Actions**) → **Docker** → **Kubernetes** → **Terraform**.
`,

  "latest-updates": `
Verified against my knowledge through my training cutoff (early 2026) — check jenkins.io/download for anything newer, since Jenkins ships frequent weekly/incremental releases plus periodic LTS (Long-Term Support) baselines.

- **Jenkins' release model**: a weekly release stream for the latest features, and a periodic LTS release (roughly every 12 weeks) that most production controllers track for stability. Always verify the current LTS version directly on jenkins.io before deploying, since this page cannot guarantee the exact latest version number at your reading time.
- **Continued Configuration as Code (JCasC) maturity**: JCasC has become the de facto standard for managing controller configuration reproducibly, and its plugin coverage (how much of a given plugin's settings can be expressed in YAML) has continued to broaden across releases.
- **Kubernetes-native agents as the default recommendation**: Jenkins' own documentation and the broader community have converged on dynamic Kubernetes-provisioned agents as the recommended pattern for new agent fleets, over maintaining static long-lived VM agents.
- **Governance under the Continuous Delivery Foundation**: Jenkins' governance (since 2019) sits under the CD Foundation (part of the Linux Foundation), reflecting its status as critical, widely used infrastructure rather than a single-vendor product.
- **Ecosystem context that matters more than any single Jenkins release**: the broader CI/CD market has continued shifting new, greenfield adoption toward SaaS/cloud-native tools (GitHub Actions, GitLab CI), while Jenkins' installed base in large, regulated, and on-premises enterprises has remained durable rather than shrinking sharply.

Given how fast plugin ecosystems and specific version numbers move, verify exact current Jenkins core and key plugin versions on jenkins.io and the Jenkins Security Advisories page before making any production decision based on a specific version claim.
`,

  "future-roadmap": `
Where Jenkins is heading, and what's worth betting career time on:

1. **Configuration as Code keeps deepening.** Expect JCasC plugin coverage to keep expanding, making "the controller itself is fully defined in version control" closer to a universal default rather than an advanced practice only mature teams adopt.
2. **Kubernetes-native agents become the unquestioned default**, with static VM agent fleets increasingly treated as a legacy pattern reserved for workloads that genuinely cannot run in a pod (specialized hardware, certain licensing constraints).
3. **Consolidation around fewer, better-maintained plugins.** The plugin ecosystem's long tail of unofficial/abandoned plugins is a widely acknowledged pain point; expect continued community and CD Foundation effort toward plugin health scoring, deprecation of unmaintained plugins, and steering users toward a smaller set of well-supported options.
4. **Jenkins' role narrows toward its genuine strengths.** Rather than competing head-on with GitHub Actions/GitLab CI for greenfield, cloud-native projects, Jenkins' practical future is increasingly concentrated in exactly the niches this page describes: self-hosted, air-gapped, heavily regulated, or deeply invested enterprise environments — a smaller but very durable market.
5. **Interoperability over replacement.** Expect continued patterns of large organizations running Jenkins for legacy/regulated pipelines while also adopting GitHub Actions or GitLab CI for newer projects side by side, rather than a single wholesale migration in either direction.

For your career: understanding Jenkins' architecture (controller/agent, Pipeline as Code, credential scoping, Shared Libraries) is valuable well beyond Jenkins itself, since the same concepts reappear, renamed, in every other CI/CD system. If you work in or expect to work in large regulated enterprises (finance, government, healthcare, telecom), deep Jenkins fluency remains a durable, in-demand skill; if your career path is squarely cloud-native startups, treat this page as strong transferable CI/CD literacy and prioritize the **GitHub Actions** skill for your primary hands-on tool.
`,

  "cheat-sheet": `
~~~groovy
// --- Minimal Declarative Pipeline ---
pipeline {
    agent { label 'linux && docker' }
    options { timeout(time: 30, unit: 'MINUTES'); timestamps() }
    environment { APP = 'orders-service' }
    parameters { choice(name: 'ENV', choices: ['staging', 'prod'], description: 'target') }

    stages {
        stage('Checkout') { steps { checkout scm } }
        stage('Build')    { steps { sh 'make build' } }
        stage('Test') {
            steps { sh 'make test' }
            post { always { junit 'reports/**/*.xml' } }
        }
        stage('Docker build') { steps { sh 'docker build -t app:tag .' } }
        stage('Docker push') {
            steps {
                withCredentials([usernamePassword(credentialsId: 'reg-creds',
                        usernameVariable: 'U', passwordVariable: 'P')]) {
                    sh 'echo P | docker login -u U --password-stdin'
                    sh 'docker push app:tag'
                }
            }
        }
        stage('Deploy') {
            when { branch 'main' }
            steps { sh 'kubectl set image deployment/app app=app:tag' }
        }
    }

    post {
        success { echo 'ok' }
        failure { echo 'notify team' }
    }
}

// --- Agent routing ---
agent { label 'gpu && cuda12' }          // route to matching agent
agent { kubernetes { yaml '''...''' } }  // dynamic ephemeral pod agent

// --- Credentials ---
withCredentials([usernamePassword(credentialsId: 'id',
        usernameVariable: 'U', passwordVariable: 'P')]) { sh '...' }
withCredentials([string(credentialsId: 'id', variable: 'TOKEN')]) { sh '...' }
withCredentials([file(credentialsId: 'id', variable: 'KUBECONFIG')]) { sh '...' }

// --- Options / control ---
options { disableConcurrentBuilds(); retry(2) }
triggers { pollSCM('H/5 * * * *') }       // legacy; prefer webhooks
parallel(a: { sh 'test-a.sh' }, b: { sh 'test-b.sh' })

// --- Shared Library usage ---
@Library('company-lib@v2.3.0') _
standardBuild(agentLabel: 'linux', buildCmd: 'make build')

// --- Scripted Pipeline (legacy/advanced escape hatch) ---
node('linux') {
    stage('Build') { sh 'make build' }
}

// --- Ops commands ---
// docker exec jenkins cat /var/jenkins_home/secrets/initialAdminPassword
// Manage Jenkins > Script Console        (admin-only, effectively RCE)
// Manage Jenkins > In-process Script Approval
// /pipeline-syntax/  — interactive Declarative syntax generator/linter
~~~
`,

  "flash-cards": `
| Front | Back |
|-------|------|
| What replaced Hudson, and why? | Jenkins — forked in 2011 after a governance/trademark dispute with Oracle; the community took the project and most contributors with it |
| Controller vs agent? | Controller schedules/coordinates and hosts the UI; agents execute actual build steps. Production builds should never run on the controller |
| Declarative vs Scripted Pipeline? | Declarative: structured, validated, recommended default. Scripted: raw Groovy, more flexible, harder to maintain consistently |
| How do you safely use a secret in a pipeline? | withCredentials, scoped to only the step that needs it — never echo or export broadly |
| What is a Shared Library for? | Reusing pipeline logic across many Jenkinsfiles, versioned like a real dependency (analogous to GitHub Actions reusable workflows) |
| Why avoid building on the controller? | Wastes the scheduler/UI resource every job depends on and expands security blast radius |
| Preferred build trigger mechanism? | Webhooks (near-instant) over SCM polling (latency, wasted cycles) — except in air-gapped networks where polling may be the only option |
| What is the Script Console? | An admin-only feature that runs arbitrary Groovy with the controller's privileges — effectively unrestricted RCE by design; must be tightly access-controlled |
| Jenkins' biggest ecosystem strength AND liability? | The plugin system — near-total integration coverage, but plugin version compatibility and security patching is a real, ongoing operational burden |
| What is JCasC? | Configuration as Code — defines the controller's own setup (security, agent clouds, tool config) in version-controlled YAML, applied at startup |
| Modern default for agent provisioning? | Dynamic, ephemeral Kubernetes pod agents over static long-lived VM agents |
| When does Jenkins genuinely beat GitHub Actions? | Self-hosted/air-gapped/regulated requirements, or a large existing Jenkins investment that migration cost doesn't justify replacing |
| What is Blue Ocean? | Jenkins' modernized visual pipeline UI; clearer stage-by-stage visualization than the classic UI |
| Why pin plugin versions? | Untested plugin upgrades are one of the most common causes of a broken production controller |
| What agent label expression syntax does? | Routes a job to only the agents advertising the matching labels — e.g. label 'gpu && cuda12' |
`,

  mcqs: `
**1. Why did Jenkins split from Hudson?**

A) A licensing fee dispute  B) A governance/trademark dispute with Oracle after it acquired Sun  C) A rewrite from Java to Groovy  D) A performance disagreement

**Answer: B** — the community forked the project and renamed it Jenkins after disagreeing with Oracle's control over the Hudson trademark and infrastructure.

**2. In production, where should build steps (compiling, testing, docker build) actually execute?**

A) On the controller, for simplicity  B) On labeled agents, never the controller  C) Split evenly between controller and agents  D) It doesn't matter

**Answer: B** — running builds on the controller wastes the shared scheduler/UI resource and expands the security blast radius; production pipelines pin agent { label ... } and disable the built-in node's executors.

**3. Which Pipeline syntax is the recommended default for most teams today?**

A) Scripted Pipeline  B) Freestyle jobs  C) Declarative Pipeline  D) XML job configuration

**Answer: C** — Declarative Pipeline's structured, validated syntax is the recommended default; Scripted remains available for genuinely dynamic control flow needs.

**4. What is the safest way to use a credential inside a pipeline step?**

A) Store it as a global environment variable available to all jobs  B) echo it once to confirm it loaded correctly  C) Scope it with withCredentials to only the step that needs it  D) Hardcode it in the Jenkinsfile since the repo is private

**Answer: C** — withCredentials injects the secret only where needed and Jenkins masks known secret values in logs; global exposure and hardcoding are both real leak vectors.

**5. What is the single most cited operational liability of Jenkins' massive plugin ecosystem?**

A) Plugins are too expensive  B) Plugin version compatibility, security patching burden, and unofficial/abandoned plugins  C) Plugins can only be written in Python  D) There are too few plugins for cloud providers

**Answer: B** — the same plugin architecture that gives Jenkins near-universal integration coverage also means a large surface of variable-quality, sometimes-abandoned code running with controller-level privileges.

**6. When does it genuinely make sense for a team to still choose Jenkins over GitHub Actions in 2026?**

A) Never — GitHub Actions has fully replaced Jenkins  B) Only for very small personal projects  C) When self-hosted/air-gapped/regulated infrastructure or a large existing Jenkins investment justifies the operational overhead  D) Only if the team dislikes YAML

**Answer: C** — Jenkins remains the correct, non-legacy choice specifically where self-hosting, air-gapping, regulatory control, or sunk investment in jobs/libraries outweighs a SaaS CI's operational convenience.
`,

  "revision-notes": `
**What Jenkins is, in 5 lines:** A self-hosted, open-source automation server for CI/CD, forked from Hudson in 2011 after a governance dispute with Oracle. A controller schedules and coordinates work; agents (static VMs or dynamic Kubernetes pods) execute the actual build steps. Pipelines are defined as code in a Jenkinsfile, checked into the same repository they build. Jenkins' enormous plugin ecosystem (1,800+) is both its greatest strength and its most cited operational liability.

**Pipeline syntax in 4 lines:** Declarative Pipeline is the structured, validated, recommended default; Scripted Pipeline is raw Groovy with full but less-guarded flexibility, used when control flow genuinely needs it. A script{} block bridges the two inside a Declarative pipeline. Shared Libraries let pipeline logic be versioned and reused across many repositories, exactly analogous to GitHub Actions' reusable workflows.

**Architecture in 4 lines:** Never build on the controller in production — it schedules and hosts the UI, agents execute. Agent labels route jobs to the right hardware/software (GPU boxes, Windows machines, compliance-restricted networks). Dynamic Kubernetes agents are the modern default over static VM fleets, since they eliminate configuration drift and scale elastically. Configuration as Code (JCasC) makes the controller itself reproducible from source control.

**Security in 4 lines:** The Script Console is RCE by design and must be tightly access-controlled. Credentials must be scoped narrowly and injected via withCredentials, never echoed or globally exported. Plugins run with controller-level privileges, so unpatched or abandoned plugins are a real attack surface. Never expose a Jenkins controller to the internet without real authentication and TLS.

**When to choose Jenkins in 3 lines:** Genuinely correct for self-hosted, air-gapped, or heavily regulated environments, and for organizations with a large existing investment in jobs and shared libraries. For a greenfield project already on GitHub with no such constraints, GitHub Actions usually wins on operational simplicity. The honest comparison is about which constraints dominate, not which tool is universally better.
`,

  "learning-roadmap": `
A realistic path to genuine Jenkins fluency (adjust pace to your background):

**Week 1 — Foundations.** Beginner Concepts + Lab 1: install Jenkins via Docker, write your first Declarative Jenkinsfile with checkout/build/test stages. Milestone: a green build with published junit results.

**Week 2 — Pipeline syntax deeply.** Intermediate Concepts: Declarative structure, environment/parameters/options, triggers (webhook vs polling), and Credentials/withCredentials. Milestone: a pipeline that safely uses a real secret without leaking it to the console log.

**Week 3 — Docker and agent routing.** Lab 2: Docker build/push staging with credentials. Study agent labels and why workload isolation matters. Milestone: a pipeline whose Docker push stage genuinely works end to end against a registry.

**Week 4 — Architecture and internals.** Internal Working, Architecture, Data Flow sections; Lab 3: configure a Kubernetes dynamic agent. Milestone: watch a build provision, run inside, and tear down an ephemeral agent pod.

**Week 5 — Production operations.** Production Usage through Deployment sections: JCasC, plugin pinning, monitoring, and the production checklist. Milestone: a Jenkins controller you could hand to a teammate and have them rebuild from source control alone.

**Week 6 — Shared Libraries and interview polish.** Advanced Concepts' Shared Library section; Lab 4: a versioned library consumed by two repositories. Review Interview and Coding Questions sections. Milestone: explain controller/agent architecture, credential scoping, and the Jenkins-vs-GitHub-Actions tradeoff out loud, unprompted.

Then continue to the **CI/CD** skill for the vendor-neutral concepts if you haven't already, and to **GitHub Actions** to build the same fluency in the leading cloud-native alternative — knowing both makes you the engineer who can make the right infrastructure call, not just operate whichever tool a team already has.
`,

  "official-docs": `
- [Jenkins User Documentation](https://www.jenkins.io/doc/) — the primary reference; the "Pipeline" section is the most important starting point.
- [Jenkinsfile / Pipeline syntax reference](https://www.jenkins.io/doc/book/pipeline/syntax/) — the authoritative Declarative and Scripted syntax guide.
- [Configuration as Code (JCasC) plugin documentation](https://github.com/jenkinsci/configuration-as-code-plugin) — for making controller configuration reproducible.
- [Jenkins Security Advisories](https://www.jenkins.io/security/advisories/) — the place to check before any production plugin/core upgrade decision.
- [Kubernetes plugin documentation](https://github.com/jenkinsci/kubernetes-plugin) — dynamic agent provisioning on Kubernetes.
- [Shared Libraries documentation](https://www.jenkins.io/doc/book/pipeline/shared-libraries/) — the reference for building reusable pipeline code.
- [Blue Ocean documentation](https://www.jenkins.io/doc/book/blueocean/) — the modernized UI; check current maintenance status before adopting as a primary interface.
`,

  books: `
- **Jenkins: The Definitive Guide** — John Ferguson Smart. The classic comprehensive introduction; some material has aged, but the mental model of jobs, plugins, and distributed builds still holds.
- **Jenkins 2: Up and Running** — Brent Laster. Focused specifically on Pipeline as Code and the Blue Ocean era; a good practical follow-up once you know the basics.
- **Continuous Delivery** — Jez Humble & David Farley. Not Jenkins-specific, but the foundational text explaining why pipelines, deployment automation, and fast feedback matter — read this to understand the "why" behind everything Jenkins mechanically implements.
- **Effective DevOps** — Jennifer Davis & Katherine Daniels. Broader organizational context for why CI/CD tooling choices (including self-hosted vs SaaS) matter beyond the technology itself.
- **Accelerate** — Nicole Forsgren, Jez Humble, Gene Kim. The research behind why CI/CD practices correlate with organizational performance — useful ammunition for justifying investment in pipeline quality to non-engineers.
`,

  blogs: `
- **Jenkins official blog** (jenkins.io/node/blog or the "Blog" section of jenkins.io) — release announcements, security advisories, and community updates directly from the project.
- **CloudBees blog** (cloudbees.com/blog) — written substantially by the commercial company founded by Jenkins' original core team; strong on enterprise operational patterns and security guidance.
- **Netflix Tech Blog** — periodic posts on running CI/CD (including Jenkins-adjacent tooling) at very large internal scale.
- **Continuous Delivery Foundation blog** (cd.foundation) — governance and ecosystem-level updates for Jenkins and sibling CD projects.
- **Individual plugin maintainer blogs/READMEs** — for any plugin you depend on heavily, the maintainer's own GitHub repo and release notes are higher-signal than any secondary blog post.
`,

  "research-papers": `
Jenkins itself is an engineering tool rather than a research subject, so this section is honestly thin on Jenkins-specific academic papers — the closest useful foundational reading is the academic and industry literature on continuous integration and continuous delivery as a practice, which Jenkins is one implementation of:

- **"Continuous Integration"** — Martin Fowler's original essay (available on martinfowler.com) formalizing the practice Jenkins automates; foundational reading even though it predates Jenkins itself.
- **Continuous Delivery** (Humble & Farley) — while a book rather than a paper, it is the closest thing to a foundational "research synthesis" of CI/CD practice and is cited extensively in both industry and academic software engineering literature.
- **"Reliable Software Engineering" / empirical CI studies** — academic software engineering venues (ICSE, FSE) periodically publish empirical studies on build systems and CI at scale (build time analysis, flaky test detection, developer productivity impact); search current ICSE/FSE proceedings for "continuous integration" for the latest empirical work, since specific paper titles and authors in this space change year to year and are worth verifying directly rather than relying on a fixed reading list here.
- **Accelerate** (Forsgren, Humble, Kim) — grounded in the State of DevOps Report research program; the closest thing to a rigorous empirical study connecting CI/CD practice quality to organizational outcomes.

If Jenkins internals specifically interest you at a research level, the more productive reading is the project's own architecture documentation and RFC-style design discussions (e.g., the Pipeline plugin's original design docs) rather than academic papers, since Jenkins' evolution has been driven by practitioner engineering, not published research.
`,

  videos: `
- **Kohsuke Kawaguchi's talks on Jenkins' origin and Pipeline** — the creator explaining the project's history and design decisions directly; search Jenkins World / DevOps World conference archives.
- **CloudBees "Jenkins World" / "DevOps World" conference talks** — the annual conference (under various names over the years) is the primary venue for deep Jenkins production talks from real practitioners.
- **"Jenkins Pipeline: A Practical Guide" style conference talks** — search recent DevOps World / Jenkins community sessions for current Declarative Pipeline and Shared Library deep dives, since specific talk titles and speakers change yearly.
- **Kubernetes plugin maintainer talks** — search for Jenkins + Kubernetes plugin conference sessions covering dynamic agent provisioning patterns in depth.
- **Continuous Delivery Foundation YouTube channel** — governance updates and cross-project (Jenkins, Tekton, Spinnaker) CI/CD ecosystem talks.

Given how quickly specific talk titles and presenters change, search "Jenkins" on the CD Foundation and CloudBees conference archives for the most current material rather than relying on a fixed list here.
`,

  "github-repos": `
- [jenkinsci/jenkins](https://github.com/jenkinsci/jenkins) — the Jenkins core source code; the canonical place to see how the controller/agent protocol and plugin API actually work.
- [jenkinsci/kubernetes-plugin](https://github.com/jenkinsci/kubernetes-plugin) — dynamic agent provisioning on Kubernetes; read the pod template examples closely.
- [jenkinsci/configuration-as-code-plugin](https://github.com/jenkinsci/configuration-as-code-plugin) — JCasC source and extensive example YAML configurations.
- [jenkinsci/pipeline-examples](https://github.com/jenkinsci/pipeline-examples) — community-maintained collection of real-world Jenkinsfile patterns.
- [jenkinsci/JenkinsPipelineUnit](https://github.com/jenkinsci/JenkinsPipelineUnit) — the unit-testing framework for Shared Library and pipeline Groovy code.
- [jenkinsci/docker](https://github.com/jenkinsci/docker) — the official Jenkins controller Docker images and their build definitions; good reference for a production-grade controller image.
- [jenkins-infra/jenkins.io](https://github.com/jenkins-infra/jenkins.io) — the source for the official documentation site itself, useful for finding the most current guidance.
`,

  "practice-problems": `
**Ordered by skill focus:**

1. *Pipeline syntax fluency*: convert a simple Freestyle job (build + shell test command) into a Declarative Jenkinsfile with checkout, build, and test stages plus published junit results.
2. *Credentials*: write a pipeline that pulls a secret via withCredentials and deliberately try to leak it (echo it directly) to confirm Jenkins masks it, then fix the pipeline to avoid the exposure pattern entirely.
3. *Agent routing*: configure two differently labeled agents (or two Kubernetes pod templates) and write a pipeline with a parallel block that runs one branch on each label, observing both execute concurrently.
4. *Triggers*: set up both a webhook trigger and a pollSCM trigger for the same job in a test environment, and time how much faster the webhook-triggered build starts.
5. *Shared Libraries*: extract a duplicated build+test stage pattern from two sample Jenkinsfiles into a Shared Library vars/ step, version it, and confirm both consumers work identically after the refactor.
6. *Debugging*: deliberately introduce a stuck step with no timeout, observe an executor being occupied indefinitely, then fix it with options { timeout(...) } and confirm the build now fails cleanly instead of hanging.
7. *Security*: configure role-based authorization so a non-administrator user can trigger builds but cannot reach the Script Console, and verify the restriction actually holds.
8. *JCasC*: define a controller's security realm and one agent cloud entirely in JCasC YAML, destroy the controller container, and recreate it from that YAML alone.

External sets: the official Jenkins "Pipeline Examples" repository (real-world Jenkinsfile patterns to study and adapt), and any general CI/CD katas that ask you to implement the same pipeline logic across Jenkins, GitHub Actions, and GitLab CI to internalize how the same concepts map across tools.
`,

  "architecture-diagram": `
The reference production architecture for a Jenkins-driven build/deploy pipeline — the shape a mature enterprise Jenkins setup takes:

~~~mermaid
flowchart TB
    Dev["Developer"] -->|git push| Git["Git host (GitHub/GitLab/on-prem)"]
    Git -->|webhook| Ctrl["Jenkins Controller\n(JCasC-configured, plugins pinned)"]
    Ctrl --> Queue["Build queue / scheduler"]
    Queue --> K8sCloud["Kubernetes agent cloud"]
    Queue --> StaticAgents["Static agent pool\n(specialized hardware: GPU, Windows)"]
    K8sCloud --> Pod1["Ephemeral agent pod\n(build + test)"]
    StaticAgents --> VM1["Static agent VM\n(label-routed workloads)"]
    Pod1 -->|docker build/push| Reg[("Container registry")]
    VM1 -->|docker build/push| Reg
    Reg --> Deploy["Deploy stage\n(kubectl / cloud deploy)"]
    Deploy --> K8s[("Kubernetes cluster")]
    Ctrl -->|shared library calls| Lib["Shared Library repo\n(versioned pipeline logic)"]
    Ctrl -->|credentials, scoped| Vault["Credentials store /\nexternal Secrets Manager"]
    Ctrl -->|post-build| Notify["Slack / email notifications"]
    subgraph Observability
        Metrics["Prometheus metrics plugin"] --> Dash["Grafana dashboard"]
    end
    Ctrl -.metrics.-> Observability
~~~

Every box maps to a section of this page: the controller's own reproducibility (JCasC, plugin pinning) lives in Production Usage and Deployment; the agent split (dynamic vs static) lives in Architecture and Scalability; credential scoping lives in Security; Shared Libraries live in Advanced Concepts; and the notification/observability pieces live in Monitoring.
`,

  "mind-map": `
~~~mermaid
mindmap
  root((Jenkins))
    History
      Hudson origin
      Oracle dispute and fork
      CD Foundation governance
    Core model
      Controller
      Agents (static and dynamic)
      Labels and routing
    Pipeline as Code
      Declarative Pipeline
      Scripted Pipeline
      Shared Libraries
      Jenkinsfile stages and steps
    Production operations
      Configuration as Code (JCasC)
      Plugin pinning and compatibility
      Credentials and secret scoping
      Kubernetes dynamic agents
    Quality and ops
      Testing (junit, JenkinsPipelineUnit)
      Debugging (console log, Script Console, py-spy-equivalent tools)
      Monitoring (Prometheus, queue depth)
      Security (Script Console, plugin CVEs)
    Ecosystem
      Blue Ocean UI
      vs GitHub Actions
      vs GitLab CI
      CloudBees commercial distribution
    Career
      Interview classics
      Labs and real projects
      When to genuinely choose Jenkins
~~~
`,
};

export default jenkins;
