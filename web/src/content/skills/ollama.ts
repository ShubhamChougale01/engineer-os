import type { SkillContent } from "../types";

/**
 * Ollama — full 50-section knowledge page.
 * Note: code blocks use ~~~ fences (CommonMark-equivalent to backtick fences)
 * so this file needs no backtick escaping inside the template literals.
 */
const ollama: SkillContent = {
  overview: `
Ollama is a tool for running open-weight large language models on your own machine with a single command — no CUDA environment to hand-configure, no Python dependency tree to resolve, no manual conversion of model weights. It packages a model-serving runtime (built on **llama.cpp**'s inference engine underneath), a model registry/distribution format modeled deliberately after Docker's image/layer approach, and a simple CLI and local HTTP API into one download.

For an AI engineer, Ollama's value is speed of iteration on your own laptop or a single workstation: pulling and running a capable open-weight model takes one command (ollama run llama3.1), and its OpenAI-compatible API endpoint means application code can be developed and tested locally before ever touching a hosted API or a production serving stack like **vLLM** or **SGLang**. It is deliberately optimized for the opposite end of the deployment spectrum from those two: ease of local setup and low-friction experimentation, not maximum concurrent-request throughput.

Key characteristics: a Modelfile format (again, deliberately Dockerfile-like) for customizing and packaging models with specific prompts, parameters, or system messages; automatic GPU detection and use where available, with a clean CPU fallback; support for a wide and growing range of quantized open-weight model formats (primarily GGUF, the format used by llama.cpp); and both a CLI and a local REST API (with an OpenAI-compatible surface) for programmatic use. It has become the default on-ramp for developers who want to "just try a local model" without first becoming an ML-infrastructure engineer.
`,

  history: `
Ollama's rise tracks closely with the broader 2023 open-weight-model boom — as soon as genuinely capable open models (Llama and its successors, Mistral, and others) became downloadable, the missing piece was an easy way to actually run one without significant setup friction.

| Year | Milestone |
|------|-----------|
| 2023 | Llama and Llama 2's release (and the broader open-weight model wave that followed) creates strong demand for a frictionless way to run these models locally, without a Python/CUDA setup |
| 2023 | Ollama launches, built on top of **llama.cpp**'s efficient CPU/GPU inference engine, wrapping it in a Docker-inspired CLI and distribution model — ollama pull and ollama run mirror docker pull and docker run deliberately |
| 2023–2024 | The Modelfile format matures, letting users customize a base model's system prompt, parameters, and behavior and package the result as a new named, shareable model, exactly as a Dockerfile customizes a base image |
| 2024 | An OpenAI-compatible API surface is added, letting existing OpenAI-client-based application code point at a local Ollama instance with minimal changes — significantly lowering the barrier to local development against open models |
| 2024 | Growing model-library support tracks new open-weight model releases (Llama 3 family, Mistral/Mixtral, Gemma, Qwen, and others) quickly after their release, given the strength of the underlying llama.cpp ecosystem's rapid architecture-support additions |
| 2024–2025 | Ollama becomes a de facto standard for local LLM development and experimentation across the AI engineering community, and is commonly cited as the easiest on-ramp for developers new to running open-weight models themselves |
| 2025 | Continued expansion of supported model formats, quantization options, and integration with popular application frameworks and IDE tooling — I'm not fully confident of every specific recent addition and would verify current details against Ollama's own release notes |

The throughline: Ollama's success is a distribution and developer-experience story built on top of someone else's (llama.cpp's) inference-engine innovation — its core contribution is making an already-capable, efficient inference engine trivially easy to install, run, and share models for, exactly analogous to what Docker did for already-existing container technology.
`,

  "why-it-exists": `
Before Ollama, running an open-weight model locally typically meant: installing Python and a specific version of PyTorch or a llama.cpp binary yourself, finding and downloading model weights from Hugging Face Hub (often in a format requiring conversion), figuring out which quantization level your hardware could actually handle, and writing your own inference script or wiring up a community project with its own particular setup quirks. Each of these steps was a plausible point of failure for anyone who wasn't already comfortable with ML infrastructure.

Ollama exists to collapse all of that into one command. Its core insight, borrowed directly and deliberately from Docker: **package distribution and a familiar CLI verb set solve an adoption problem that a superior underlying technology alone does not.** llama.cpp had already solved the hard technical problem (efficient quantized inference on consumer hardware, in C++, with broad model-architecture support) years before Ollama existed — what was missing was the "docker pull, docker run" experience layered on top of it: a registry of ready-to-use models, one-command pulls, automatic hardware detection, and a simple way to customize and share a configured model.

What Ollama deliberately does **not** solve: it does not push the frontier of inference-engine performance itself (that's llama.cpp's, and separately vLLM's/SGLang's, job) — it solves the adoption and developer-experience problem sitting on top of an already-solved inference problem, for the specific use case of local, single-user (or small-scale) model running rather than high-concurrency production serving.
`,

  "problem-it-solves": `
Ollama removes concrete, measurable pains for local and small-scale LLM usage:

- **Setup friction.** ollama run llama3.1 downloads and runs a capable open-weight model in one command, with no separate CUDA/Python environment setup required for the common case — a developer can go from "nothing installed" to "chatting with a local model" in a few minutes.
- **Hardware-awareness complexity.** Ollama automatically detects available GPU acceleration (where present) and falls back cleanly to CPU inference otherwise, so most users never need to manually reason about which quantization or backend fits their specific hardware.
- **Model packaging and sharing.** The Modelfile format lets a customized model configuration (a specific system prompt, parameter set, or fine-tune) be packaged and shared as a single named artifact, exactly as a Dockerfile packages a customized container image — this makes "here's the exact model configuration I used" reproducible and shareable in a way ad hoc scripts rarely are.
- **A consistent local API surface for development.** The OpenAI-compatible local HTTP API means application code can be built and iterated on against a free, private, local model before ever calling (and paying for) a hosted API, or before standing up a heavier production serving stack.

What Ollama deliberately does **not** solve:

- **High-concurrency production serving.** It is not designed to be the engine behind a high-traffic, many-concurrent-user production API — that is squarely **vLLM**'s or **SGLang**'s job, both of which are built around maximizing concurrent-request throughput in a way Ollama's local-first design does not prioritize.
- **Multi-GPU, multi-node serving of very large models at scale.** Ollama's sweet spot is a single machine (with zero, one, or a modest number of GPUs); it is not the tool for tensor-parallel or pipeline-parallel serving of a frontier-scale model across a GPU cluster.
- **Fine-tuning or training.** Ollama runs inference on existing model weights; it does not train or fine-tune models itself (though it can run a checkpoint you fine-tuned elsewhere, once converted to a supported format).
`,

  "learning-objectives": `
By the end of this page you should be able to:

1. Explain what Ollama actually is (a distribution/developer-experience layer over llama.cpp's inference engine) and why that framing matters for understanding its strengths and limits.
2. Install Ollama and run, list, and remove models via its CLI.
3. Write a Modelfile to customize a base model's system prompt and parameters, and package it as a new named model.
4. Call a running Ollama instance both via its native API and via its OpenAI-compatible endpoint from application code.
5. Reason about model selection and quantization tradeoffs for a given machine's available memory and compute.
6. Compare Ollama against **vLLM** and **SGLang** and choose deliberately based on whether the use case is local development/single-user versus production concurrent serving.
7. Identify Ollama's production-adjacent use cases (small-scale internal tools, edge/offline deployment) versus where a dedicated production serving engine is the correct choice instead.
8. Recognize Ollama's security-relevant considerations when its API is exposed beyond localhost.
`,

  prerequisites: `
- **Required**: basic command-line comfort — installing software, running commands, reading terminal output.
- **Required**: a general sense of what an LLM is and how a chat-style interaction with one works; no deep transformer internals knowledge is needed to use Ollama productively, though it deepens your understanding of what's happening underneath.
- **Helpful**: basic **Docker** familiarity, since Ollama's CLI verbs (pull, run, list, rm) and its Modelfile format are deliberately modeled on Docker's images/Dockerfile conventions — recognizing that parallel accelerates learning Ollama considerably.
- **Helpful**: basic **Python** fluency for writing client code against Ollama's API, whether the native API or its OpenAI-compatible surface.
- **Helpful**: awareness of what quantization is (running a model at reduced numerical precision to save memory) — Ollama handles most of this automatically, but understanding the tradeoff helps with model selection.

Dependency chain: general LLM/chat-interaction familiarity → **Docker** conventions (helpful, not required) → this page → compare against **vLLM** and **SGLang** once you need production-scale serving rather than local development.
`,

  "beginner-concepts": `
### Installing and running your first model

~~~bash
# Install Ollama (platform-specific installer; check ollama.com for your OS)
# On many systems, a single install script or package manager command suffices

# Pull and run a model in one step -- downloads on first use, then runs interactively
ollama run llama3.1

# Inside the interactive session, just type a message and press enter:
# >>> What is the capital of France?
~~~

### The core CLI verbs (deliberately Docker-like)

~~~bash
ollama pull mistral          # download a model without running it yet
ollama list                  # show locally downloaded models
ollama run mistral           # run a model interactively (pulls it first if not present)
ollama rm mistral            # remove a locally downloaded model, freeing disk space
ollama ps                    # show currently running/loaded models
~~~

### Calling Ollama's local API

~~~python
import requests

# Ollama's native API -- runs locally, no API key needed by default
response = requests.post(
    "http://localhost:11434/api/generate",
    json={"model": "llama3.1", "prompt": "Explain quantization in one sentence.", "stream": False},
    timeout=30,   # even local calls deserve a timeout -- a stuck model shouldn't hang your app
)
print(response.json()["response"])
~~~

### Using it through the OpenAI-compatible endpoint

~~~python
from openai import OpenAI

# Point the standard OpenAI client at your local Ollama instance
client = OpenAI(base_url="http://localhost:11434/v1", api_key="ollama")  # api_key is unchecked locally

response = client.chat.completions.create(
    model="llama3.1",
    messages=[{"role": "user", "content": "What is the capital of France?"}],
    timeout=30,
)
print(response.choices[0].message.content)
~~~

### A first Modelfile

~~~text
# Modelfile -- deliberately similar to a Dockerfile
FROM llama3.1

# Customize the system prompt and generation parameters
SYSTEM "You are a terse assistant. Answer in one sentence whenever possible."
PARAMETER temperature 0.3
~~~

~~~bash
# Build a new named model from the Modelfile, then run it
ollama create terse-assistant -f ./Modelfile
ollama run terse-assistant
~~~
`,

  "intermediate-concepts": `
### GGUF and quantization levels

Ollama primarily runs models in the **GGUF** format (the format used by the underlying llama.cpp engine), which bundles a model's weights, quantization metadata, and some configuration into a single file. Most model library entries are available at several quantization levels, trading accuracy for memory and speed:

~~~bash
# Pull a specific quantization variant explicitly
ollama pull llama3.1:8b-instruct-q4_K_M    # 4-bit, a common balanced default
ollama pull llama3.1:8b-instruct-q8_0      # 8-bit, higher fidelity, more memory
ollama pull llama3.1:70b-instruct-q4_K_M   # a much larger model, still quantized to fit
~~~

Rule of thumb: lower-bit quantizations (e.g. 4-bit) use roughly proportionally less memory than higher-bit ones (e.g. 8-bit or 16-bit), at some accuracy cost that varies by model and task — for local experimentation this tradeoff is usually acceptable, but validate against your own **AI Evals** before trusting a specific quantization level for anything production-adjacent.

### Modelfile parameters in more depth

~~~text
FROM mistral

# System prompt shapes the model's default persona/behavior
SYSTEM "You are a Python coding assistant. Always include type hints in code examples."

# Generation parameters
PARAMETER temperature 0.2
PARAMETER top_p 0.9
PARAMETER num_ctx 8192          # context window size Ollama will allocate for this model
PARAMETER stop "<|end|>"        # custom stop sequence

# A TEMPLATE directive can customize the exact prompt format sent to the underlying model
TEMPLATE """{{ if .System }}<|system|>
{{ .System }}<|end|>
{{ end }}<|user|>
{{ .Prompt }}<|end|>
<|assistant|>
"""
~~~

The num_ctx parameter matters in particular: it determines how much context-window memory Ollama reserves for that model, directly trading off against how many models (or how much else) can fit in available memory simultaneously.

### Structured output and function calling

Ollama supports constraining output to a JSON schema and OpenAI-compatible tool/function calling for models that support it, directly relevant to the **Structured Outputs** skill's broader discipline:

~~~python
from openai import OpenAI
import json

client = OpenAI(base_url="http://localhost:11434/v1", api_key="ollama")

response = client.chat.completions.create(
    model="llama3.1",
    messages=[{"role": "user", "content": "Extract the name and age: John is 34 years old."}],
    response_format={"type": "json_object"},   # constrain output to valid JSON
    timeout=30,
)
data = json.loads(response.choices[0].message.content)
print(data)   # e.g. {"name": "John", "age": 34}
~~~

### Multi-modal models

Ollama supports a growing set of vision-capable (multi-modal) open-weight models, letting an image be included alongside text in a request:

~~~python
import requests
import base64

with open("photo.jpg", "rb") as f:
    image_b64 = base64.b64encode(f.read()).decode()

response = requests.post(
    "http://localhost:11434/api/generate",
    json={"model": "llava", "prompt": "Describe this image.", "images": [image_b64], "stream": False},
    timeout=60,
)
print(response.json()["response"])
~~~

### Embeddings

Ollama can also serve embedding models locally, relevant directly to the **Embeddings** and **Vector Search** skills for building a fully local RAG or **Semantic Caching** pipeline without any external API dependency:

~~~python
response = requests.post(
    "http://localhost:11434/api/embeddings",
    json={"model": "nomic-embed-text", "prompt": "What is the capital of France?"},
    timeout=15,
)
vector = response.json()["embedding"]
~~~
`,

  "advanced-concepts": `
### What Ollama actually is, underneath: a thin, well-designed layer over llama.cpp

Understanding Ollama's architecture correctly requires separating two things it's easy to conflate: the inference engine doing the actual model computation (llama.cpp, a mature, highly-optimized C/C++ project supporting efficient CPU inference and GPU offloading across multiple backends) and Ollama's own contribution (packaging, distribution, the Modelfile abstraction, automatic hardware detection, and a friendly API/CLI). This is directly analogous to Docker's relationship with underlying container primitives (cgroups, namespaces) that existed in the Linux kernel before Docker made them easy to use — Docker's genius was developer experience and distribution, not inventing containerization itself; Ollama's genius is the same move applied to local LLM inference.

### GPU offloading and memory management

Ollama automatically determines how many of a model's layers to offload to GPU memory versus keeping on CPU, based on available VRAM — a model too large to fit entirely in GPU memory can still run via partial GPU offloading (some layers on GPU, some on CPU), trading some speed for the ability to run a larger model than would otherwise fit. This automatic behavior is a meaningful part of Ollama's ease-of-use value proposition: a user with a modest consumer GPU doesn't need to manually calculate how many layers to offload — Ollama estimates this itself, though it can be manually overridden for advanced tuning.

### Concurrency and multi-request behavior

Ollama's default design center is a single user (or a small number of low-concurrency requests) on one machine, not many concurrent requests at production scale — while recent versions have added some support for handling multiple concurrent requests and keeping multiple models loaded, this remains fundamentally different in design intent and achievable throughput from vLLM's or SGLang's continuous-batching, high-concurrency architecture. Treating Ollama as a drop-in replacement for a production serving engine under real concurrent load is a common and costly misunderstanding — see Comparisons for the precise boundary.

### Model library versus bring-your-own-GGUF

Most Ollama usage pulls a pre-packaged model from Ollama's own model library (a curated, growing set of popular open-weight models, pre-converted to GGUF and offered at common quantization levels). Advanced usage can also import an arbitrary GGUF file (including one you've quantized or fine-tuned yourself) via a Modelfile's FROM directive pointing at a local file path rather than a library model name — this is the on-ramp for running a custom fine-tune locally through Ollama's convenient interface.

### The Docker-inspired distribution model, examined closely

Ollama models are distributed as layered artifacts (weights, a Modelfile-derived configuration layer, and metadata) pushed to and pulled from a registry, exactly mirroring how a Docker image is composed of layered filesystem diffs pulled from a registry like Docker Hub. This means ollama push (for models you've customized) and a shared model namespace work conceptually the same way sharing a custom Docker image does — a deliberate, well-executed borrowing of a proven distribution model rather than inventing a new one.
`,

  "internal-working": `
Here is what happens, step by step, when you run ollama run some-model and send it a prompt:

~~~mermaid
flowchart TD
    A["ollama run some-model"] --> B{"Model already\npulled locally?"}
    B -- no --> C["Pull layers from Ollama's\nregistry (weights, config, metadata)"]
    C --> D["Store as local GGUF +\nModelfile-derived configuration"]
    B -- yes --> D
    D --> E["Detect available hardware\n(GPU VRAM, CPU, memory)"]
    E --> F["Decide GPU/CPU layer offload split"]
    F --> G["Load model into memory\n(llama.cpp inference engine underneath)"]
    G --> H["Ollama server process\nlistens on localhost:11434"]
    H --> I["CLI or API request arrives"]
    I --> J["Apply Modelfile's SYSTEM prompt,\nPARAMETERs, and TEMPLATE formatting"]
    J --> K["Run inference via llama.cpp\n(CPU and/or GPU, as determined)"]
    K --> L["Stream tokens back\nto CLI or API caller"]
~~~

1. **Pull (if needed).** If the requested model isn't already downloaded, Ollama fetches its layers (weights, configuration, metadata) from its registry, mirroring how a container runtime pulls image layers.
2. **Hardware detection.** Ollama inspects available GPU memory and decides how much of the model can be offloaded to GPU versus kept on CPU, aiming to maximize speed within the hardware actually available.
3. **Model load.** The model is loaded into memory by the underlying llama.cpp engine, honoring the GPU/CPU split decided above.
4. **Server listening.** Ollama runs a background server process (by default on localhost:11434) that the CLI itself, or any other client, talks to via HTTP — meaning ollama run is itself just a client of this local server, not a separate code path.
5. **Request handling.** An incoming request (from the CLI, the native API, or the OpenAI-compatible endpoint) has any Modelfile-defined system prompt, parameters, and prompt template applied before being handed to the inference engine.
6. **Inference and streaming.** The underlying llama.cpp engine runs the actual forward passes (prefill then decode, exactly as with any transformer inference), and tokens stream back to whichever client made the request.

The core internal fact worth remembering: ollama run's interactive CLI experience is built on the exact same local HTTP API that any of your own application code calls — there is no special, separate "interactive mode" code path, which is precisely why writing a client against the API feels so consistent with using the CLI directly.
`,

  architecture: `
A senior engineer thinks about Ollama at two levels: how it's structured internally as a local client-server system, and how to structure a local-development or small-scale application around it.

### Internal architecture

~~~mermaid
flowchart TB
    subgraph Machine["Your machine"]
        CLI["ollama CLI\n(pull, run, list, rm, ps)"]
        subgraph Server["Ollama server process\n(localhost:11434)"]
            API["Native API + OpenAI-compatible API"]
            ModelMgr["Model manager\n(Modelfile parsing, config layering)"]
            HW["Hardware detector\n(GPU/CPU offload decision)"]
        end
        Engine["llama.cpp inference engine"]
        Storage[("Local model storage\n(GGUF files + metadata)")]
    end
    CLI --> API
    API --> ModelMgr --> HW --> Engine
    Engine --> Storage
    ModelMgr --> Storage
~~~

### Application architecture — local-first development workflow

~~~
mylocalapp/
├── src/mylocalapp/
│   ├── client/
│   │   └── ollama_client.py    # OpenAI-client wrapper pointed at localhost:11434
│   ├── models/
│   │   └── Modelfile           # customized system prompt / parameters, version-controlled
│   └── core/
│       └── config.py           # OLLAMA_BASE_URL env var, swappable for a hosted endpoint
└── tests/
    └── fixtures/                # deterministic, mocked responses for CI (no real model calls)
~~~

Rules: application code talks to Ollama through one thin client module, exactly as it would talk to a hosted API — the base URL is a configuration value, not a hardcoded string, so the same application code can point at a local Ollama instance during development and at a production **vLLM**/**SGLang** deployment (or a hosted API) in production, since all three commonly expose an OpenAI-compatible surface. Version-control the Modelfile alongside application code so the exact local model configuration used during development is reproducible by any teammate.
`,

  "data-flow": `
Trace one interactive chat message end to end, from typing into ollama run to seeing a response:

~~~mermaid
sequenceDiagram
    participant User
    participant CLI as ollama CLI
    participant Server as Ollama Server (localhost:11434)
    participant Engine as llama.cpp Engine

    User->>CLI: types a message, presses enter
    CLI->>Server: POST /api/generate (or /api/chat)
    Server->>Server: apply Modelfile SYSTEM/PARAMETER/TEMPLATE
    Server->>Engine: tokenize + run inference
    Engine->>Engine: prefill (process prompt)
    Engine-->>Server: first token ready
    Server-->>CLI: stream first token
    CLI-->>User: display first token
    loop decode, one token at a time
        Engine-->>Server: next token
        Server-->>CLI: stream token
        CLI-->>User: display token
    end
    Engine-->>Server: generation complete (EOS or max tokens)
    Server-->>CLI: stream closed
~~~

The critical thing this trace makes visible: the CLI is not a special privileged client — it talks to the exact same local HTTP server your own application code would call, which is why anything you can do interactively via ollama run, you can also do programmatically via a simple HTTP request or the OpenAI-compatible client library, with identical underlying behavior.
`,

  "production-usage": `
### Where it actually gets deployed

Ollama's most common home is local development and experimentation — a developer's laptop or workstation, used to prototype an LLM-backed feature before it's connected to a production model-serving backend. Beyond pure local development, it also shows up in: small-scale internal tools where a handful of users need occasional LLM access on shared modest hardware, offline or air-gapped environments where calling a hosted API isn't possible or permitted, and edge/on-device deployment scenarios where running a small quantized model locally (rather than round-tripping to a remote server) is the whole point.

### Typical local development workflow

~~~bash
# Pull once, then it's cached locally
ollama pull llama3.1

# Point application code at localhost during development
export OLLAMA_BASE_URL="http://localhost:11434/v1"

# Swap to a production endpoint (vLLM, SGLang, or a hosted API) for staging/production
export OLLAMA_BASE_URL="https://my-production-vllm-gateway.internal/v1"
~~~

Because Ollama's OpenAI-compatible API surface closely mirrors what **vLLM** and hosted providers also expose, application code written against this interface transfers with minimal changes across local development and production deployment — this is one of Ollama's most practically valuable properties for a development workflow, even for teams that never run Ollama itself in production.

### Configuration guidance

- Set num_ctx in a Modelfile (or per-request) to match what your development/testing actually needs — an unnecessarily large context window reserves more memory than a typical local machine may want to spare.
- Choose a quantization level appropriate to available hardware; if a model won't fit comfortably, prefer a smaller model or a more aggressive quantization over forcing a borderline configuration that thrashes memory.
- For small-scale internal tools with a handful of concurrent users, benchmark Ollama's actual achievable concurrency for your hardware before committing to it as the backend — if concurrent load grows meaningfully, migrating to **vLLM** or **SGLang** (both of which can serve the same or similar open-weight models) is the natural next step, not a sign Ollama failed at its actual job.

I'm not confident of every current specific configuration default or the exact current concurrency behavior across Ollama versions — check the current official documentation for specifics before finalizing any configuration decision beyond pure local development.
`,

  "industry-examples": `
- **AI application developers broadly** use Ollama as the default local-development companion for building and testing LLM-backed features before wiring up a production backend — this is by far its most common real-world usage pattern, even though it's less often the subject of a named "industry example" than a production serving engine would be.
- **Educational and tutorial content across the AI engineering community** overwhelmingly uses Ollama as the "run a model locally" on-ramp in walkthroughs and courses, given how low the setup friction is compared to alternatives — this has made it something close to the default teaching tool for hands-on local LLM experimentation.
- **IDE and developer-tool integrations** (a variety of code editors, notebook environments, and local AI-assistant plugins) commonly support Ollama as a local model backend option, specifically because of its consistent, easy-to-target local API.
- **Small teams and individual developers building offline-capable or privacy-sensitive tools** (where sending data to a hosted API isn't acceptable) use Ollama to run models entirely on infrastructure they control, down to a single machine.

I don't have verified, specific, attributable large-enterprise production-deployment case studies for Ollama beyond this general adoption pattern (which is genuinely its primary use case, unlike vLLM's more common role as a production serving backend) — I'd rather flag that honestly than invent a specific enterprise example, and would recommend checking Ollama's own community showcase content for current, real examples.
`,

  "best-practices": `
1. **Use Ollama for local development and experimentation; migrate to a dedicated production serving engine (vLLM, SGLang) once you need real concurrent-request throughput.** Conflating these two use cases is the single most common Ollama mistake.
2. **Version-control your Modelfiles alongside application code**, so the exact local model configuration a team relies on is reproducible, not tribal knowledge.
3. **Point application code at Ollama through configuration (an environment variable for the base URL), not a hardcoded localhost string**, so the same code can target a production endpoint without changes.
4. **Choose quantization level deliberately based on available hardware**, and validate any quantization choice you'll rely on for anything beyond casual experimentation against your own evals.
5. **Set num_ctx to match actual need**, rather than defaulting to the largest context window a model supports, to avoid unnecessary memory pressure on a local machine.
6. **Pull specific model versions/tags deliberately** rather than always relying on a floating "latest" reference, for reproducibility across a team or over time.
7. **Treat Ollama's API exactly like any other network dependency in your own code** — set timeouts, handle errors, don't assume a local call can never hang or fail.
8. **Use ollama ps and ollama list to manage local disk and memory footprint deliberately** — downloaded models and loaded-in-memory models both consume resources that are easy to forget about on a shared or resource-constrained machine.
9. **Don't expose Ollama's API beyond localhost without adding real authentication and network controls** — its default posture assumes a trusted local user, not a multi-tenant or internet-facing deployment.
10. **Benchmark before assuming Ollama can handle your concurrency needs** for any beyond-personal-use scenario — don't discover its concurrency ceiling in production.
`,

  "anti-patterns": `
### Treating Ollama as a production serving engine at real concurrent scale

~~~bash
# WRONG: deploy Ollama as the backend for a customer-facing product
# serving hundreds of concurrent users, assuming it scales like vLLM

# RIGHT: use Ollama for local development and prototyping; deploy to
# vLLM or SGLang once real concurrent production traffic is the requirement
~~~

Ollama's design center is a single user or low-concurrency local use — expecting production-serving-engine-level concurrent throughput from it is a mismatch of tool to job, not a bug.

### Exposing Ollama's API to the network with no authentication

~~~bash
# WRONG: bind Ollama's server to 0.0.0.0 and expose it directly to the internet
# or an untrusted network with no auth layer in front

# RIGHT: keep it on localhost for personal use, or put a real authenticating
# gateway in front if it must be reachable beyond one trusted machine
~~~

### Hardcoding localhost in application code

~~~python
# WRONG: baked-in local URL, breaks the moment you deploy anywhere else
client = OpenAI(base_url="http://localhost:11434/v1", api_key="ollama")

# RIGHT: read the base URL from configuration, defaulting to local for dev
import os
client = OpenAI(base_url=os.environ.get("OLLAMA_BASE_URL", "http://localhost:11434/v1"), api_key="ollama")
~~~

### Ignoring Modelfile version control

Treating a customized Modelfile as a one-off local artifact, never committed anywhere, means the exact model configuration a demo or feature depended on is lost the moment the machine it was built on is gone — commit Modelfiles alongside the application code that depends on them.

### Assuming the largest available quantization is always better

Defaulting to the highest-fidelity (largest) quantization "to be safe" without considering whether it actually fits comfortably in available memory can produce a machine that thrashes or swaps under load — choose a quantization level that fits your hardware with headroom, and validate accuracy tradeoffs empirically rather than assuming bigger is strictly better for your specific use case.
`,

  performance: `
### Measure first

~~~bash
# Check what's currently loaded and its resource footprint
ollama ps

# Time a request end to end to get a real baseline before tuning anything
time ollama run llama3.1 "Summarize the plot of Hamlet in two sentences."
~~~

### The optimization hierarchy for local Ollama usage

1. **Choose an appropriately-sized model for your hardware first.** A smaller model that fits comfortably (with GPU offload headroom) will almost always outperform a larger model that's thrashing between GPU and CPU memory or swapping to disk.
2. **Pick a quantization level matched to available memory.** A 4-bit quantized variant that fits entirely in GPU memory will typically outperform an 8-bit or 16-bit variant forced into partial CPU offload on the same hardware.
3. **Set num_ctx to actual need, not the model's maximum.** A smaller context window reserves less memory, leaving more headroom for the model itself and other local applications.
4. **Verify GPU offload is actually happening**, if you expect it — check Ollama's logs or ollama ps output to confirm GPU memory is being used, rather than assuming acceleration is active.
5. **Close other GPU-memory-hungry applications** when running a borderline-fit model locally — Ollama shares the machine's GPU with everything else running on it, unlike a dedicated production serving deployment.
6. **For batch/offline local workloads (not interactive chat), consider whether a smaller, more aggressively quantized model is "good enough"** for the specific task, trading some quality for meaningfully faster local iteration speed during development.

### What Ollama is not the right lever for

If your actual bottleneck is serving many concurrent production requests efficiently, no amount of local Ollama tuning addresses that — that's the problem **vLLM**'s PagedAttention and continuous batching, or **SGLang**'s RadixAttention, are specifically built to solve; recognizing "this is a concurrency problem, not a local-inference-speed problem" early avoids wasted tuning effort in the wrong layer.
`,

  scalability: `
Ollama's scalability story is narrower and more honest than a production serving engine's: it scales up to the limits of one machine's hardware, and is not designed to scale out to many machines or many concurrent users the way **vLLM** or **SGLang** are.

~~~mermaid
flowchart LR
    subgraph OneMachine["One machine (Ollama's design center)"]
        GPU["GPU (if available)"]
        CPU["CPU fallback / partial offload"]
        RAM["System RAM"]
    end
    OneMachine -.does not horizontally scale.-> Other["Other machines\n(not Ollama's job)"]
~~~

### Vertical scaling (bigger/better single machine)

More GPU memory lets a larger model, or a higher-fidelity quantization, run comfortably with full GPU offload; more system RAM helps when running larger models with partial CPU offload. This is the only scaling axis Ollama is designed around — there's no built-in tensor/pipeline parallelism across multiple GPUs or multiple machines the way vLLM offers.

### Where Ollama's design boundary is

| Need | Answer |
|---|---|
| A few concurrent local requests, one machine | Ollama handles this reasonably, verify with your own benchmark |
| Many concurrent production users | Migrate to **vLLM** or **SGLang** — this is squarely their design center, not Ollama's |
| A model too large for one machine's memory even quantized | Not Ollama's use case — needs tensor/pipeline parallelism (vLLM) or a smaller/more quantized model |
| Multi-machine horizontal scaling | Not Ollama's job — run a dedicated production serving engine behind a load balancer instead |
| Edge/offline single-device deployment | Ollama (or the underlying llama.cpp directly) is squarely the right tool here |

The senior framing: Ollama's "scalability limit" isn't a shortcoming to work around — it's a deliberate design tradeoff in exchange for its ease of use, and the correct response to outgrowing it is switching tools for the production-serving use case, not trying to force Ollama past its design center.
`,

  security: `
### Ollama-specific attack surface

Ollama's default posture assumes a trusted, single-user local environment, which becomes a real security consideration the moment that assumption stops holding — see **AI Red Teaming** for the broader adversarial-testing practice this connects to.

1. **No authentication by default.** Ollama's local API, by default, does not require authentication — appropriate for a genuinely single-user local machine, but a real risk if the server is bound to a network interface reachable by other users or machines without an authenticating layer added in front.
2. **Network exposure.** Binding Ollama's server to 0.0.0.0 (all network interfaces) instead of localhost-only makes it reachable from the local network or, if misconfigured on a cloud instance, potentially the broader internet — this should be a deliberate, reviewed decision, never an accident.
3. **Resource exhaustion on a shared machine.** A very large or unbounded generation request on a shared or resource-constrained machine can exhaust memory or make the machine unresponsive for other users — sensible limits (num_ctx, max tokens) matter even in ostensibly "just local" contexts if the machine is shared.
4. **Model/checkpoint supply-chain risk.** Pulling a model from an unofficial or unverified source (rather than Ollama's own curated library, or a well-verified GGUF file) carries the same supply-chain risk as installing any untrusted software artifact — prefer the official model library or well-verified sources for custom GGUF imports.
5. **Prompt injection and content risk are unchanged by running locally.** Running a model on your own machine doesn't remove the need for appropriate content handling if that model's output feeds into any automated action or is shown to other users — see **Prompt Injection Defense**.

### Concrete defenses

- Keep Ollama bound to localhost unless there's a specific, reviewed reason to expose it more broadly, and add a real authenticating gateway in front if broader access is genuinely needed.
- Set sensible resource limits (context size, max generation length) even for local use on shared machines.
- Prefer models from Ollama's official library or well-verified sources when importing custom GGUF files.
- Apply the same prompt-injection and content-moderation discipline to a locally-run model's output as you would to any hosted API's output, if that output is acted upon or displayed further.

See the dedicated **AI Red Teaming**, **Prompt Injection Defense**, and **Secrets Management** skills for the broader adversarial-testing, defense, and credential-handling practices this connects to.
`,

  testing: `
Testing an Ollama-backed application spans the same layers as testing any LLM-integrated application, with the added consideration that local model behavior can differ from a production backend's.

~~~python
# tests/test_ollama_client.py
import pytest
from myapp.client.ollama_client import OllamaClient

@pytest.fixture
def client():
    return OllamaClient(base_url="http://localhost:11434/v1", timeout=10)

def test_chat_returns_text(client, respx_mock):
    respx_mock.post("http://localhost:11434/v1/chat/completions").respond(
        json={"choices": [{"message": {"content": "Paris"}, "finish_reason": "stop"}]}
    )
    result = client.chat("What is the capital of France?")
    assert "Paris" in result

def test_client_times_out_gracefully(client, respx_mock):
    import httpx
    respx_mock.post("http://localhost:11434/v1/chat/completions").mock(
        side_effect=httpx.TimeoutException("simulated hang")
    )
    with pytest.raises(TimeoutError):
        client.chat("this should time out")

def test_base_url_is_configurable(monkeypatch):
    monkeypatch.setenv("OLLAMA_BASE_URL", "https://production-endpoint.internal/v1")
    from myapp.client.ollama_client import build_client
    client = build_client()
    assert client.base_url == "https://production-endpoint.internal/v1"
~~~

### The senior testing doctrine for Ollama-backed applications

- **Never depend on a real, running local model in CI.** Mock the HTTP layer (respx, httpx_mock) so tests are deterministic, fast, and don't require a multi-gigabyte model download in a CI runner.
- **Test that the client's base URL is genuinely configurable**, since the whole value of using an OpenAI-compatible surface is being able to swap Ollama for a production backend without code changes — a hardcoded localhost URL defeats this.
- **If you do run integration tests against a real local Ollama instance**, keep them separate from your main CI suite (e.g. a manually-triggered or nightly job on a machine with the model already pulled), since model downloads and inference time make them unsuitable for a fast, frequent CI loop.
- **Validate any Modelfile customization (system prompt, parameters) with a small, explicit eval set**, exactly as you would validate a prompt change in any other LLM application — see **AI Evals**.
- **Test graceful degradation** if the local Ollama server isn't running or is unreachable — your application should fail clearly and helpfully, not hang or crash confusingly.
`,

  debugging: `
### The toolbox, in escalation order

1. **Check ollama ps first.** Confirms which models are currently loaded and gives a sense of current resource usage — many "why is this slow/not responding" questions start here.
2. **Check the Ollama server logs.** Startup and runtime logs report model loading progress, GPU detection results, and errors — most configuration or hardware-detection issues are visible here directly.
3. **Verify GPU detection explicitly if performance seems CPU-bound.** Check the logs (or system GPU monitoring tools) to confirm Ollama actually offloaded layers to GPU as expected, rather than assuming acceleration is active.

~~~bash
# Confirm what's currently loaded and check for obvious resource issues
ollama ps

# On systems with nvidia-smi, cross-check actual GPU memory usage
nvidia-smi
~~~

4. **Reproduce with the CLI directly**, bypassing your application code entirely, to isolate whether an issue is in Ollama/the model itself or in your own client/application logic.
5. **Check for a version mismatch after an Ollama upgrade.** Behavior, default parameters, and API shape can change between versions of a fast-moving project — if something that worked stops working after an upgrade, check the release notes for relevant changes before assuming your own code broke.
6. **Watch memory and disk usage directly** (system monitoring tools) when running a borderline-fit model — symptoms that look like a "hang" are very often the OS swapping memory to disk under pressure, not an actual Ollama or model bug.
7. **Isolate Modelfile-related issues by testing the base model without customization first**, to confirm whether a SYSTEM prompt, PARAMETER, or TEMPLATE change introduced the behavior you're debugging.
`,

  monitoring: `
### What to track, even for local/small-scale usage

Ollama is not typically instrumented with the same production-grade observability stack as a serving engine like **vLLM**, but even local and small-scale deployments benefit from basic visibility:

~~~python
import time

def timed_request(client, prompt: str) -> tuple[str, float]:
    """Even for local development, measuring actual latency avoids
    tuning blind or assuming performance characteristics you haven't verified."""
    start = time.perf_counter()
    result = client.chat(prompt)
    elapsed_ms = (time.perf_counter() - start) * 1000
    return result, elapsed_ms
~~~

### What matters and why

- **Response latency for your actual prompts**, not a generic benchmark — local hardware and specific prompt/context lengths meaningfully affect real experienced latency.
- **Memory usage while a model is loaded** (via ollama ps and system tools) — especially relevant on a shared or resource-constrained machine, to catch a configuration that's quietly thrashing memory.
- **Whether GPU offload is actually active**, if you expect acceleration — silently falling back to CPU-only inference is a common, easy-to-miss performance regression after a driver update or configuration change.
- **For small-scale internal-tool deployments (beyond pure personal local use): basic request success/failure tracking and response time**, even if lighter-weight than a full production observability stack, so a degrading small-scale deployment doesn't go unnoticed until users complain.

If your usage genuinely grows into needing serious observability (dashboards, alerting, tail-latency tracking), that's itself a strong signal you've outgrown Ollama's local-first design center and should evaluate **vLLM** or **SGLang** for that workload instead, where this kind of production observability (see those pages' own Monitoring sections) is a first-class design consideration.
`,

  deployment: `
### Local installation (the primary "deployment")

~~~bash
# Most common path: an OS-specific installer from ollama.com,
# or a package manager command for your platform -- check current
# official instructions rather than assuming one universal command

# Verify the installation and pull a first model
ollama --version
ollama pull llama3.1
~~~

### Containerized usage (for small-scale or reproducible deployments)

~~~dockerfile
# Dockerfile -- running Ollama itself in a container, for a small shared
# internal tool or a reproducible local development environment
FROM ollama/ollama:latest

# Models are typically pulled at container start or baked into a custom image
# for faster startup, depending on your reproducibility vs. image-size tradeoff
EXPOSE 11434

CMD ["serve"]
~~~

~~~yaml
# docker-compose.yml -- a small internal-tool deployment pattern
services:
  ollama:
    image: ollama/ollama:latest
    ports:
      - "11434:11434"
    volumes:
      - ollama_models:/root/.ollama   # persist downloaded models across restarts
    deploy:
      resources:
        reservations:
          devices:
            - driver: nvidia
              count: 1
              capabilities: [gpu]
volumes:
  ollama_models:
~~~

Per-line rationale: the named volume persists downloaded models so they aren't re-pulled on every container restart (multi-gigabyte downloads are expensive to repeat); GPU reservation (where available) lets the containerized Ollama instance still use hardware acceleration; exposing only the port you actually need to reach, on a network you control, keeps the default-no-auth API from becoming an accidental open door.

### When NOT to containerize-and-deploy Ollama as "production"

If the deployment is meant to serve real concurrent production traffic rather than a small internal tool or reproducible development environment, containerizing Ollama doesn't change its underlying concurrency design — that use case calls for **vLLM** or **SGLang** instead, deployed with the production-shaped patterns covered on those pages.
`,

  "production-checklist": `
Before relying on an Ollama deployment for anything beyond pure personal local use:

- [ ] Confirmed the workload's actual concurrency needs fit within Ollama's realistic capacity for your hardware (benchmarked, not assumed)
- [ ] Network exposure deliberately reviewed — bound to localhost unless broader access is genuinely required and authenticated
- [ ] Authentication/authorization added in front if the API is reachable beyond one trusted local user
- [ ] Modelfile(s) version-controlled alongside the application code that depends on them
- [ ] Base URL configurable via environment/config, not hardcoded, so the same client code can target a different backend later
- [ ] Quantization level chosen deliberately for available hardware, with accuracy tradeoffs validated for anything beyond casual experimentation
- [ ] num_ctx and other Modelfile parameters set to actual need, not defaults assumed to be fine
- [ ] Client-side timeouts configured on every call, exactly as for any other network dependency
- [ ] Basic monitoring in place for any beyond-personal-use deployment (request success/failure, latency)
- [ ] Model source verified (official library or well-verified GGUF) for any custom model import
- [ ] A clear, documented decision point for when to migrate to vLLM/SGLang if concurrency or scale needs grow
- [ ] Downloaded-model disk usage and loaded-model memory usage monitored on shared/resource-constrained machines
`,

  "common-mistakes": `
1. **Deploying Ollama as a production serving backend for real concurrent user traffic**, discovering its concurrency ceiling only under actual load rather than benchmarking it deliberately beforehand.
2. **Exposing Ollama's API beyond localhost with no authentication**, treating its default trusted-single-user posture as safe in a shared or network-reachable context.
3. **Hardcoding localhost URLs in application code**, losing the main practical benefit (an OpenAI-compatible surface that's swappable for a production backend) of using Ollama for local development in the first place.
4. **Never version-controlling Modelfiles**, losing reproducibility of the exact local model configuration a feature or demo depended on.
5. **Assuming the largest quantization available is always the right choice**, without checking whether it actually fits comfortably in available hardware.
6. **Confusing Ollama's ease of use with production-readiness** for high-concurrency, high-availability serving — these are different design goals, not different maturity levels of the same goal.
7. **Not setting client-side timeouts against a local Ollama instance**, treating "local" as synonymous with "can never hang."
8. **Ignoring memory/disk footprint on a shared development machine**, letting multiple large downloaded models and loaded-in-memory models silently consume shared resources.
9. **Skipping evals when validating a Modelfile's customized system prompt or a chosen quantization level**, assuming a "looks fine in a few manual tries" check is sufficient.
10. **Not having a clear migration plan to vLLM/SGLang** when a project that started as an Ollama-based prototype grows into needing real production concurrency.
`,

  "common-errors": `
| Error / symptom | Typical cause | Fix |
|---|---|---|
| Model runs much slower than expected | GPU offload not active, model too large for available VRAM causing heavy CPU fallback | Check ollama ps and GPU monitoring tools; try a smaller model or more aggressive quantization |
| Out of memory / system becomes unresponsive | Model too large for available RAM/VRAM, or num_ctx set too high | Choose a smaller model or quantization level; reduce num_ctx to actual need |
| Connection refused on localhost:11434 | Ollama server not running, or bound to a different address/port | Confirm the Ollama service is running; check its configured bind address |
| Client receives unexpected response shape | Application code assumes a different Ollama version's API shape, or mismatched native vs. OpenAI-compatible endpoint usage | Verify which endpoint (native /api/... vs. OpenAI-compatible /v1/...) your client is actually calling; check version-specific docs |
| Custom Modelfile behavior not taking effect | Forgot to rebuild with ollama create after editing the Modelfile, or referencing the wrong model name | Re-run ollama create with the updated Modelfile; confirm you're running the customized model's name, not the base model |
| Download stuck or fails partway | Network interruption during a large model pull, or insufficient disk space | Retry the pull; verify available disk space before pulling large models |
| Multiple models loaded, unexpectedly high memory use | Ollama configured to keep multiple models resident, or a prior ollama run process not released | Check ollama ps; explicitly stop/unload models not currently needed |
| Response quality noticeably worse than expected for a "known good" model | Wrong quantization level pulled, or a Modelfile parameter (temperature, system prompt) inadvertently altering behavior | Confirm the exact model tag/quantization pulled; check the Modelfile for unintended customizations |

The general habit: check ollama ps and the server logs first for nearly every one of these symptoms — current resource state and recent errors are almost always visible there before you need to guess.
`,

  faqs: `
**Q: Is Ollama the same thing as llama.cpp?**
No — llama.cpp is the underlying inference engine doing the actual model computation; Ollama is a distribution, packaging, and developer-experience layer built on top of it (plus its own model manager, hardware-detection logic, and API), in the same relationship Docker has to underlying Linux container primitives.

**Q: Can I use Ollama in production?**
For small-scale internal tools, offline/edge deployment, or genuinely low-concurrency use cases, yes, with appropriate hardening (authentication if exposed beyond localhost, sensible resource limits). For high-concurrency production serving, no — that's the use case **vLLM** and **SGLang** are specifically designed for; Ollama's concurrency model is not built for that scale.

**Q: Does Ollama support every open-weight model?**
It supports a large and continually growing set of popular open-weight models through its library, plus the ability to import a custom GGUF file directly — but not literally every model architecture that exists; check its current model library before committing to a specific, especially newly-released, model.

**Q: How does Ollama decide between GPU and CPU?**
It automatically detects available GPU memory and decides how many of a model's layers to offload to GPU versus keep on CPU, aiming to maximize achievable speed given available hardware — this can typically also be manually overridden for advanced tuning.

**Q: Is my data sent anywhere when I use Ollama?**
Model inference itself runs entirely locally on your machine once the model is downloaded — no prompt or response data needs to leave your machine for the actual generation, which is a meaningful privacy/data-residency advantage over calling a hosted API. (Downloading the model itself, of course, requires network access to Ollama's registry the first time.)

**Q: Should I use Ollama or vLLM for my project?**
See the Comparisons section for the full breakdown — briefly: Ollama for local development, experimentation, and low-concurrency/offline use; vLLM (or **SGLang**) once you need to serve many concurrent production users efficiently.

**Q: Can I fine-tune a model with Ollama?**
No — Ollama runs inference on existing model weights; it does not train or fine-tune models itself. You can, however, run a model you've fine-tuned elsewhere (once converted to GGUF) through Ollama via a custom Modelfile pointing at your local checkpoint file.
`,

  "interview-questions": `
**Junior/Mid:**

1. *What is Ollama, at its core?* A tool for easily running open-weight LLMs locally with a single command, built as a distribution and developer-experience layer on top of the llama.cpp inference engine, with a Docker-inspired CLI and Modelfile format.
2. *What is a Modelfile?* A configuration file (deliberately modeled on a Dockerfile) that customizes a base model's system prompt, generation parameters, and prompt template, and packages the result as a new named, shareable model via ollama create.
3. *How do you call a running Ollama instance from Python?* Either via its native REST API (e.g. POST to /api/generate or /api/chat) or via its OpenAI-compatible endpoint using the standard OpenAI client library pointed at Ollama's local base URL.
4. *What format does Ollama primarily use for model weights?* GGUF, the format used by the underlying llama.cpp engine, which bundles weights, quantization metadata, and some configuration into a single file.
5. *What determines whether Ollama uses GPU or CPU for inference?* Automatic hardware detection based on available GPU memory; Ollama decides how many model layers to offload to GPU versus keep on CPU, and can be manually overridden.

**Senior:**

6. *How is Ollama's relationship to llama.cpp analogous to Docker's relationship to Linux container primitives?* llama.cpp (like cgroups/namespaces for Docker) solved the hard underlying technical problem (efficient quantized local inference) first; Ollama (like Docker) added the missing distribution, packaging, and developer-experience layer — an easy CLI, a model registry, and automatic hardware handling — without itself inventing the core inference technology.
7. *Why is it a mistake to deploy Ollama as a production serving backend for high-concurrency traffic?* Ollama's design center is a single user or low-concurrency local use; it lacks the continuous-batching, PagedAttention-style memory management that **vLLM** and **SGLang** are specifically architected around for maximizing concurrent-request throughput — using Ollama there means hitting a concurrency ceiling that a purpose-built serving engine wouldn't.
8. *How would you structure application code so it can develop against Ollama locally and deploy against a production serving engine without changes?* Write application code against an OpenAI-compatible client interface with the base URL read from configuration/environment, not hardcoded — since Ollama, vLLM, and many hosted providers all expose a similar API shape, the same client code transfers across environments by changing only the base URL.
9. *What are the security implications of exposing Ollama's API beyond localhost?* Ollama's default posture assumes a trusted single local user with no built-in authentication; exposing it to a network without adding an authenticating layer in front risks unauthorized access, resource exhaustion from unbounded requests, and treating a fundamentally single-user tool as if it were hardened multi-tenant infrastructure.
10. *When would a project reasonably migrate from Ollama to vLLM or SGLang?* When actual measured concurrency needs exceed what's comfortably achievable on Ollama's single-machine, lower-concurrency design (verified via benchmarking, not assumption), or when the deployment genuinely needs multi-GPU/multi-node scaling that Ollama isn't built to provide.
11. *How does quantization choice interact with Ollama's automatic GPU/CPU offload decision?* A more aggressively quantized (smaller) model is more likely to fit entirely within available GPU memory, enabling full GPU offload and faster inference; a larger or less-quantized model may force partial CPU offload, trading fidelity for hardware fit at some performance cost.
12. *What's the main practical value of Ollama's OpenAI-compatible API surface, beyond convenience?* It lets application code be developed and tested locally, for free, against a private model, using the exact same client interface that will later call a production backend (self-hosted or hosted), minimizing the code changes needed to go from local prototype to deployed application.
`,

  "coding-questions": `
### 1. A configurable client that transparently swaps local and production backends (tests architecture reasoning)

~~~python
import os
from openai import OpenAI

def build_llm_client(default_local_url: str = "http://localhost:11434/v1") -> OpenAI:
    """Read the backend URL from configuration, defaulting to a local Ollama
    instance for development -- the same client code works unchanged against
    a production vLLM/SGLang deployment or a hosted API by only changing this value."""
    base_url = os.environ.get("LLM_BASE_URL", default_local_url)
    api_key = os.environ.get("LLM_API_KEY", "ollama")   # Ollama ignores this locally; production needs a real key
    return OpenAI(base_url=base_url, api_key=api_key, timeout=30)

client = build_llm_client()
response = client.chat.completions.create(
    model=os.environ.get("LLM_MODEL_NAME", "llama3.1"),
    messages=[{"role": "user", "content": "hello"}],
)
~~~

Complexity: O(1). Follow-up: extend to support per-environment default model names (a smaller local model for dev, a larger production model), and add a retry-with-backoff wrapper for transient failures.

### 2. A Modelfile generator with parameter validation (tests config-discipline reasoning)

~~~python
def build_modelfile(base_model: str, system_prompt: str, temperature: float = 0.7, num_ctx: int = 4096) -> str:
    """Generate a Modelfile string with basic parameter validation --
    catching an invalid config before it's written to disk and built."""
    if not (0.0 <= temperature <= 2.0):
        raise ValueError(f"temperature must be between 0.0 and 2.0, got {temperature}")
    if num_ctx <= 0:
        raise ValueError(f"num_ctx must be positive, got {num_ctx}")
    if '"' in system_prompt:
        # Guard against breaking the Modelfile's SYSTEM directive quoting
        raise ValueError("system_prompt must not contain double quotes")

    return f'''FROM {base_model}

SYSTEM "{system_prompt}"
PARAMETER temperature {temperature}
PARAMETER num_ctx {num_ctx}
'''

modelfile_text = build_modelfile(
    base_model="llama3.1",
    system_prompt="You are a terse assistant. Answer in one sentence whenever possible.",
    temperature=0.3,
)
print(modelfile_text)
~~~

Complexity: O(1). Follow-up: extend to support multiple PARAMETER lines and a TEMPLATE directive, and write the result to a file with a confirmation step before overwriting an existing Modelfile.

### 3. Resilient local client with graceful "server not running" handling (production-flavored, even for local tools)

~~~python
import httpx
from openai import OpenAI, APIConnectionError, APITimeoutError

class ResilientOllamaClient:
    """Wraps the OpenAI client pointed at a local Ollama instance, with a clear,
    actionable error message if the local server simply isn't running --
    a very common local-development failure mode worth handling explicitly."""

    def __init__(self, base_url: str = "http://localhost:11434/v1", timeout: float = 30):
        self.client = OpenAI(base_url=base_url, api_key="ollama", timeout=timeout)

    def chat(self, prompt: str, model: str = "llama3.1") -> str:
        try:
            response = self.client.chat.completions.create(
                model=model,
                messages=[{"role": "user", "content": prompt}],
                max_tokens=500,   # always bound generation length explicitly
            )
            return response.choices[0].message.content
        except APIConnectionError:
            raise RuntimeError(
                "Could not reach Ollama -- is 'ollama serve' running? "
                "Try: ollama run " + model
            ) from None
        except APITimeoutError:
            raise RuntimeError(
                f"Ollama request timed out after {self.client.timeout}s -- "
                "the model may be too large for this machine, or still loading."
            ) from None
~~~

Complexity: O(1). Follow-up: add a check that pings ollama ps (or the local API's model-list endpoint) at client construction time to fail fast with a clear message if the requested model isn't pulled yet, rather than failing deep inside a chat call.
`,

  "hands-on-labs": `
### Lab 1 — Install and run your first local model (beginner, ~30min)
Install Ollama, pull and run a small open-weight model interactively, and have a short conversation with it via the CLI. Then call the same model via a raw HTTP request (requests library) and via the OpenAI-compatible client, comparing the three interaction modes. Skills: installation, the core CLI verbs, the API surface.

### Lab 2 — Build and share a custom Modelfile (intermediate, ~1h)
Write a Modelfile that customizes a base model's system prompt and a couple of generation parameters for a specific persona or task (e.g. a terse code-review assistant), build it with ollama create, and verify its behavior differs measurably from the base model on a small set of test prompts. Skills: Modelfile authoring, basic prompt-behavior validation.

### Lab 3 — Local-to-production-portable client code (advanced, ~2h)
Build a small application (e.g. a CLI tool or simple API) whose LLM client reads its backend URL and model name from configuration, defaulting to a local Ollama instance. Verify the exact same application code works unchanged when pointed at a different OpenAI-compatible endpoint (a **vLLM** server if you have one running from the vLLM skill's labs, or a hosted API). Skills: portable client architecture, the practical payoff of an OpenAI-compatible surface.

### Lab 4 — Quantization and hardware-fit benchmarking (production-adjacent, ~2h)
Pull the same model at two different quantization levels, measure actual latency and memory usage for each on your available hardware, and (if feasible) run a small hand-built eval set against both to observe any quality difference. Deliverable: a short report recommending a quantization level for your specific hardware and use case, with real measured numbers. Skills: quantization tradeoff reasoning, basic evals discipline applied to a local-serving decision.
`,

  "real-projects": `
Portfolio-grade projects that demonstrate this skill to employers:

1. **Fully local, privacy-preserving RAG assistant** — a retrieval-augmented Q&A tool running entirely on local infrastructure: Ollama for both the chat model and an embedding model (see the **Embeddings** and **Vector Search** skills), a local vector store, with zero data leaving the machine. Demonstrates: understanding of the full local-LLM stack and genuine appreciation for when data-residency/privacy requirements make this architecture the right choice over a hosted API.

2. **Local-development-to-production-parity demo** — build one application with a fully portable LLM client (base URL and model name from configuration), demonstrate it working identically against a local Ollama instance and a self-hosted **vLLM** deployment, and document the exact deployment story for moving from one to the other. Demonstrates: the practical architectural payoff of standardizing on an OpenAI-compatible client interface across environments.

3. **Custom persona/task model packaging and benchmarking tool** — a small tool that takes a base model, a system prompt, and a set of test prompts, builds a customized Modelfile, and reports before/after behavior differences plus latency/memory characteristics for a few quantization levels, producing a data-driven recommendation. Demonstrates: rigorous, evals-grounded local-model configuration decisions rather than "it seemed fine when I tried it."

Each project: full type hints, a pytest suite covering client configuration and graceful-failure behavior, CI (with real model calls excluded from the fast test suite), and a README documenting hardware requirements and honestly-measured performance numbers — the engineering discipline around local-model usage is what distinguishes a portfolio piece here from a casual demo.
`,

  "case-studies": `
### Ollama as Docker's playbook applied to local LLM inference
Ollama's CLI verbs (pull, run, list, rm), its Modelfile format, and its layered-artifact distribution model are a deliberate, close mirror of Docker's own conventions. Lesson: when an underlying technology (llama.cpp's efficient local inference) is already mature and technically sound, the biggest remaining lever for adoption is often developer experience and distribution — borrowing a proven, already-familiar interaction model (Docker's) rather than inventing a new one lowers the learning curve to nearly zero for anyone who already knows Docker.

### The open-weight model boom creating exactly the gap Ollama filled
The rapid 2023 wave of genuinely capable open-weight models (Llama 2 and successors, Mistral, and others) created strong developer demand for an easy way to actually run them, at precisely the moment Ollama launched building on llama.cpp's already-solid inference engine. Lesson: timing a developer-experience product to ride an existing technology wave (rather than needing to also solve the underlying hard technical problem from scratch) is a recurring pattern in successful infrastructure tooling.

### Ollama's role in AI engineering education
Across tutorials, courses, and onboarding materials in the broader AI engineering community, Ollama has become close to the default "try a local model" recommendation, given how dramatically lower its setup friction is compared to alternatives. Lesson: a tool's real-world impact is not only measured by production deployment scale — becoming the default teaching and onboarding tool for an entire skill area is itself a significant, if less traditionally "enterprise," form of adoption success.

I don't have verified, specific, attributable large-scale enterprise production case studies for Ollama beyond this general pattern (which genuinely reflects its primary real-world use case, distinct from vLLM's more common production-serving role) — I'd rather flag that honestly than invent a specific enterprise example.
`,

  comparisons: `
| Dimension | Ollama | vLLM | SGLang | Plain llama.cpp (direct) |
|---|---|---|---|---|
| Primary design goal | Extremely easy local/single-user setup | High-throughput production server-style serving | Structured-generation-heavy serving, RadixAttention prefix sharing | Maximum control, minimal abstraction, embeddable |
| Setup complexity | Very low (single command, auto-downloads models) | Moderate (CUDA environment, config tuning) | Moderate, similar to vLLM | Low-to-moderate, more manual than Ollama |
| Concurrent request throughput | Lower — optimized for single-user/local use, not high concurrency | Very high (PagedAttention + continuous batching) | Very high, competitive with or exceeding vLLM on structured-output-heavy workloads | Depends heavily on manual configuration; not built around continuous batching by default |
| API shape | Native API plus an OpenAI-compatible endpoint | OpenAI-compatible HTTP server | OpenAI-compatible HTTP server | No built-in server; a library/binary you integrate yourself |
| Model packaging | Modelfile (Docker-inspired), curated model library | Loads Hugging Face-format checkpoints directly | Loads Hugging Face-format checkpoints directly | Requires GGUF conversion yourself if not already available |
| Hardware handling | Fully automatic GPU/CPU detection and offload | Explicit configuration (tensor-parallel-size, gpu-memory-utilization) | Explicit configuration, similar to vLLM | Manual configuration of layers-on-GPU and similar flags |
| Best at | Local development, personal use, quick experimentation, offline/edge use | General-purpose production self-hosted serving at scale | Workloads with heavy structured generation and/or many shared-prefix requests | Maximum low-level control, embedding inference directly into another application |

**How seniors choose**: reach for **Ollama** for local development, quick experimentation, offline/edge deployment, or genuinely low-concurrency small-scale tools — its ease of setup is the whole value proposition, and fighting its concurrency ceiling for a production workload is a sign the wrong tool was chosen. Reach for **vLLM** as the default, broadly-adopted choice once real concurrent production serving is the requirement. Reach for **SGLang** when the workload is heavily structured-generation-oriented or has significant shared-prefix reuse patterns its RadixAttention approach specifically targets. Reach for plain llama.cpp directly only when you need lower-level control or are embedding inference into another piece of software rather than wanting a ready-made CLI/server experience. Many real workflows use more than one across a project's lifecycle: Ollama for local development, vLLM or SGLang for production.
`,

  "related-technologies": `
- **llama.cpp** — the efficient inference engine underneath Ollama; understanding this relationship (distribution/UX layer versus inference engine) is the single most clarifying piece of context for reasoning correctly about what Ollama is and isn't.
- **vLLM** and **SGLang** — the production-serving-focused siblings in this platform's Model Serving & Inference category; the natural next step once a project outgrows Ollama's local-first design center.
- **Hugging Face** — the broader model-hosting ecosystem; many models available in Ollama's library originate from checkpoints also available on Hugging Face Hub, converted to GGUF.
- **Docker** — the direct inspiration for Ollama's CLI verbs, Modelfile format, and distribution model; understanding Docker deepens intuition for Ollama immediately.
- **OpenAI Responses API** — the hosted-API convention Ollama's OpenAI-compatible endpoint deliberately mirrors, enabling portable client code across local, self-hosted, and hosted backends.
- **Structured Outputs** — the broader discipline of reliable, schema-conformant LLM output; Ollama's JSON-mode and function-calling support are concrete local implementations of this discipline.
- **Embeddings** and **Vector Search** — directly relevant when using Ollama's embedding-model support to build a fully local RAG pipeline.
- **AI Evals** — the discipline for validating that a Modelfile customization or quantization choice hasn't silently degraded output quality, even for local/experimental use.
- **AI Red Teaming** and **Prompt Injection Defense** — the adversarial-testing and defense practices that remain necessary regardless of whether a model runs locally via Ollama or is called through a hosted API.

On this platform, a natural path: **Docker** (helpful context) → this page → **vLLM** and **SGLang** for production-scale serving once local prototyping outgrows Ollama's design center.
`,

  "latest-updates": `
Verified against my knowledge through early-to-mid 2025, with less certainty about the most recent months leading up to today's date — Ollama is an actively developed project with frequent releases, and I'd recommend checking its official GitHub repository and release notes directly before treating any specific detail below as current.

- **Continued growth of the model library**, tracking new popular open-weight model releases (successive Llama versions, Mistral/Mixtral variants, Gemma, Qwen, and others) typically within a relatively short window after their release, given the strength of the underlying llama.cpp ecosystem's architecture-support work.
- **Expanding structured-output, function-calling, and multi-modal (vision) model support** as these capabilities mature across the broader open-weight model ecosystem — check current documentation for which specific models support which features.
- **Ongoing performance and concurrency improvements**, narrowing (though likely not eliminating) some of the gap between Ollama's local-first design and dedicated production serving engines for moderate-concurrency use cases — I'd verify current concurrency behavior directly against the latest release notes rather than assuming a fixed capability.
- **Continued integration with popular development tooling** (IDE plugins, notebook environments, agent frameworks) as Ollama's role as the default local-LLM on-ramp has solidified across the developer community.

I do not have confident, verified knowledge of the very latest specific release contents, version numbers, or newly added features as of today's date — treat this section as directional and verify anything load-bearing to a real decision against Ollama's current, primary documentation and release notes.
`,

  "future-roadmap": `
Where this space appears to be heading, and what's worth investing career time in:

1. **Continued narrowing (but likely not closing) of the concurrency gap with dedicated serving engines.** Expect Ollama to keep improving multi-request and multi-model handling for moderate local/small-scale use cases, while still deliberately not chasing vLLM/SGLang-level production concurrency as its core design goal — the durable skill is recognizing which side of that line your actual workload sits on.
2. **Deepening integration as the default local-development companion for agentic and RAG-heavy applications.** As frameworks and protocols like **Agent-to-Agent (A2A) Protocol** and **Model Context Protocol** mature, expect Ollama to remain a common local-testing backend for developing against these standards before deploying to production infrastructure.
3. **Broader multi-modal model support** as vision-and-text (and potentially other modality) open-weight models continue to mature and proliferate, tracking the underlying llama.cpp ecosystem's own architecture-support growth.
4. **Growing role in edge and on-device deployment scenarios**, where running a small, quantized model locally (rather than round-tripping to any remote server) is the actual product requirement, not just a development convenience — a genuinely distinct use case from local development that shares the same underlying tool.
5. **Continued borrowing of proven developer-experience patterns** from other domains (much as it borrowed Docker's conventions), as the project matures — the transferable insight is the general strategy of pairing a technically solid but developer-experience-poor underlying technology with a familiar, low-friction interface layer.

For your career: the durable, tool-agnostic skills here are understanding the real distinction between local-development/low-concurrency tooling and production-serving infrastructure, reasoning clearly about quantization and hardware-fit tradeoffs, and building application code against a portable API interface so your development environment and production deployment can diverge in backend without diverging in code — those transfer regardless of which specific local-inference tool wins at any given moment.
`,

  "cheat-sheet": `
~~~bash
# --- Install and run ---
# platform-specific installer from ollama.com
ollama pull llama3.1              # download without running
ollama run llama3.1               # download (if needed) and run interactively
ollama list                       # show locally downloaded models
ollama rm llama3.1                # free disk space
ollama ps                         # show currently loaded/running models

# --- Call it: native API ---
curl http://localhost:11434/api/generate -d '{
  "model": "llama3.1", "prompt": "hello", "stream": false
}'

# --- Call it: OpenAI-compatible API (python) ---
from openai import OpenAI
client = OpenAI(base_url="http://localhost:11434/v1", api_key="ollama")
client.chat.completions.create(
    model="llama3.1",
    messages=[{"role": "user", "content": "hello"}],
    timeout=30,
)

# --- Modelfile (Docker-inspired customization) ---
# Modelfile:
#   FROM llama3.1
#   SYSTEM "You are a terse assistant."
#   PARAMETER temperature 0.3
#   PARAMETER num_ctx 8192
ollama create terse-assistant -f ./Modelfile
ollama run terse-assistant

# --- The core idea ---
# Ollama = distribution + developer-experience layer OVER llama.cpp
# (exactly like Docker is a UX layer over Linux container primitives)
# It does NOT reinvent inference -- it makes an already-good engine trivial to use

# --- Quantization tags ---
ollama pull llama3.1:8b-instruct-q4_K_M   # smaller, less memory, some accuracy cost
ollama pull llama3.1:8b-instruct-q8_0     # larger, higher fidelity, more memory
# validate accuracy tradeoffs against real evals for anything beyond casual use

# --- GPU/CPU ---
# Ollama auto-detects available GPU memory and decides layer offload split
# check with: ollama ps / nvidia-smi (if applicable)

# --- Embeddings (fully local RAG) ---
curl http://localhost:11434/api/embeddings -d '{
  "model": "nomic-embed-text", "prompt": "some text"
}'

# --- Where it fits vs where it doesn't ---
# GOOD: local dev, prototyping, offline/edge, low-concurrency internal tools
# WRONG TOOL FOR: high-concurrency production serving -- use vLLM or SGLang instead

# --- Portable client pattern ---
base_url = os.environ.get("LLM_BASE_URL", "http://localhost:11434/v1")
# same client code -> local Ollama in dev, vLLM/SGLang/hosted API in production

# --- Security musts if exposed beyond localhost ---
# no auth by default -- add a real authenticating gateway before broad network exposure
# set sensible num_ctx / max-token limits even for "just local" shared machines
~~~
`,

  "flash-cards": `
| Front | Back |
|-------|------|
| What is Ollama, fundamentally? | A distribution and developer-experience layer over the llama.cpp inference engine, for easy local LLM running |
| What is Ollama's relationship to llama.cpp, in one analogy? | Same as Docker's relationship to underlying Linux container primitives — packaging and UX over an already-solved technical problem |
| What format does Ollama primarily use? | GGUF — bundles weights, quantization metadata, and configuration in one file |
| What is a Modelfile? | A Dockerfile-inspired config file customizing a base model's system prompt, parameters, and template, packaged via ollama create |
| How does Ollama decide GPU vs CPU? | Automatic detection of available GPU memory, deciding how many layers to offload; can be manually overridden |
| What API surface does Ollama expose? | Both a native REST API and an OpenAI-compatible endpoint |
| Is Ollama good for high-concurrency production serving? | No — its design center is single-user/low-concurrency local use; use vLLM or SGLang for production concurrency |
| What CLI verbs mirror Docker? | pull, run, list, rm — deliberately modeled on docker's own verbs |
| What does num_ctx control? | The context-window size Ollama reserves in memory for a given model |
| Is authentication enabled by default? | No — Ollama assumes a trusted single local user; add a real gateway before exposing it beyond localhost |
| What's the main practical payoff of the OpenAI-compatible endpoint? | Application code developed locally against Ollama can point at a production backend (vLLM, SGLang, or a hosted API) with minimal changes |
| Can Ollama fine-tune models? | No — it runs inference on existing weights only; fine-tuning happens elsewhere, the result can then be imported |
| When should a project migrate off Ollama? | When measured concurrency needs exceed what's realistic on one machine — migrate to vLLM or SGLang for production serving |
`,

  mcqs: `
**1. What is Ollama's core relationship to llama.cpp?**

A) Ollama replaced llama.cpp entirely  B) Ollama is a distribution/UX layer built on top of llama.cpp's inference engine  C) They are unrelated competing projects  D) llama.cpp is built on top of Ollama

**Answer: B** — Ollama packages and simplifies access to llama.cpp's already-solved efficient-inference technology, analogous to Docker's relationship with Linux container primitives.

**2. What is the primary design goal Ollama optimizes for?**

A) Maximum concurrent-request throughput at production scale  B) Ease of local setup and single-user/low-concurrency use  C) Multi-node distributed training  D) Fine-tuning open-weight models

**Answer: B** — Ollama's whole value proposition is frictionless local setup, not production-scale concurrent serving (that's vLLM's/SGLang's job).

**3. What is a Modelfile used for?**

A) Storing training data  B) Customizing a base model's system prompt, parameters, and template, then packaging it as a new named model  C) Configuring network firewall rules  D) Defining a Kubernetes deployment

**Answer: B** — it's deliberately modeled on a Dockerfile, customizing and packaging a model configuration.

**4. Why would deploying Ollama as a high-concurrency production backend be a mistake?**

A) Ollama cannot run any open-weight models  B) Its design center is single-user/low-concurrency local use, lacking vLLM/SGLang-style continuous-batching architecture for production concurrency  C) Ollama requires a paid license for production use  D) Ollama only runs on CPU, never GPU

**Answer: B** — Ollama isn't architected around maximizing concurrent-request throughput the way dedicated production serving engines are.

**5. What does Ollama's OpenAI-compatible API endpoint enable practically?**

A) Nothing beyond convenience  B) Application code written against the OpenAI client interface can point at Ollama locally, then a production backend later, with minimal changes  C) It requires a paid OpenAI API key to function  D) It only works with OpenAI's own models

**Answer: B** — this portability across local development and production deployment is one of Ollama's most practically valuable properties.

**6. What is the security implication of Ollama having no authentication by default?**

A) None — it's always perfectly safe  B) It's fine only if the server stays on localhost for a trusted single user; exposing it more broadly without adding auth is a real risk  C) It automatically encrypts all traffic regardless  D) It requires biometric authentication by default

**Answer: B** — Ollama's default posture assumes trusted, local, single-user access; broader network exposure needs a deliberately added authentication layer.
`,

  "revision-notes": `
**The core idea in 3 lines:** Ollama is a tool for running open-weight LLMs locally with a single command, built as a distribution and developer-experience layer over the llama.cpp inference engine — its CLI verbs, Modelfile format, and layered distribution model are deliberately modeled on Docker's own conventions. It solves an adoption/friction problem sitting on top of an already-solved inference-engine problem, not a new inference-performance problem itself.

**The mechanism in 4 lines:** ollama pull/run fetches model layers from a registry if needed, then Ollama's local server automatically detects available GPU memory and decides a GPU/CPU offload split before loading the model via llama.cpp. Requests (from the CLI, native API, or OpenAI-compatible endpoint) have any Modelfile-defined system prompt, parameters, and template applied before inference runs and tokens stream back — the CLI itself is just another client of the same local HTTP server your own application code calls.

**Where it fits and where it doesn't, in 4 lines:** Ollama's design center is local development, quick experimentation, offline/edge deployment, and low-concurrency small-scale internal tools — not high-concurrency production serving, which is squarely **vLLM**'s and **SGLang**'s job. Its most practically valuable property is an OpenAI-compatible API surface, letting application code developed locally against Ollama transfer to a production backend with minimal changes. Migrating off Ollama once concurrency needs genuinely grow is the correct response, not a sign Ollama failed at its actual purpose.

**Configuration and hardware in 3 lines:** GGUF is the primary model format; quantization level (e.g. 4-bit vs. 8-bit) trades memory and speed for accuracy, validated against real evals for anything beyond casual use. num_ctx controls context-window memory reservation and should be sized to actual need. Ollama automates GPU/CPU offload decisions, which is a major part of its ease-of-use value but can be manually overridden for advanced tuning.

**Security and production discipline in 3 lines:** No authentication by default assumes a trusted single local user — exposing the API beyond localhost without adding real authentication is a genuine risk, not a theoretical one. Modelfiles should be version-controlled alongside application code for reproducibility. Application client code should read its backend URL from configuration, never hardcode localhost, so the same code portably targets local development and production deployment.
`,

  "learning-roadmap": `
A realistic path to solid working competency with Ollama (adjust pace to your background):

**Week 1 — Foundations.** Install Ollama, complete Lab 1 (first local model, all three interaction modes: CLI, raw HTTP, OpenAI-compatible client). Read Beginner and Intermediate Concepts. Milestone: you can explain, out loud, what Ollama actually is versus llama.cpp underneath it.

**Week 2 — Customization.** Complete Lab 2 (a custom Modelfile for a specific persona/task), experimenting with system prompts and parameters, and validate the customization actually changed behavior on a small set of test prompts. Milestone: a version-controlled Modelfile you'd be comfortable sharing with a teammate.

**Week 3 — Portable architecture.** Complete Lab 3 (build application code with a configurable backend URL, verify it works unchanged against a different OpenAI-compatible endpoint). If you've completed the **vLLM** skill's labs, test pointing the same client code at that server. Milestone: you can articulate exactly why the OpenAI-compatible surface matters practically, not just abstractly.

**Week 4 — Hardware and quality tradeoffs.** Complete Lab 4 (quantization and hardware-fit benchmarking with real measured numbers). Milestone: a short, data-driven report recommending a quantization level for your specific hardware, backed by actual measurements rather than assumption.

**Week 5 — Portfolio project.** Build one of the Real Projects end to end — the fully local, privacy-preserving RAG assistant is the most broadly instructive choice, since it exercises the full local-LLM stack (chat model, embeddings, vector store) in one coherent system.

Then continue to **vLLM** and **SGLang** on this platform to build the comparative judgment for when a project has genuinely outgrown Ollama's local-first design center and needs production-scale serving instead.
`,

  "official-docs": `
- [Ollama official website](https://ollama.com/) — installation instructions, the model library, and general project information; check here first for platform-specific install steps.
- [Ollama GitHub repository](https://github.com/ollama/ollama) — source code, issue tracker, release notes/changelog, and the most reliable place to verify current feature status and API details.
- [Ollama API documentation](https://github.com/ollama/ollama/blob/main/docs/api.md) — the native REST API reference (generate, chat, embeddings, and other endpoints).
- [llama.cpp repository](https://github.com/ggml-org/llama.cpp) — the underlying inference engine's own documentation, valuable for understanding what's happening beneath Ollama's abstraction layer.
- [OpenAI API reference](https://platform.openai.com/docs/api-reference) — useful as a cross-reference, since Ollama's OpenAI-compatible endpoint mirrors this shape closely.

I'm not fully confident every one of these URLs reflects the current, canonical location given how documentation sites reorganize over time — verify each link resolves and search Ollama's own site if it has moved.
`,

  books: `
- I'm not aware of a mature, dedicated book specifically about Ollama as of my knowledge cutoff — it's a fast-moving, primarily documentation-and-community-driven project rather than one with book-length treatments yet, and I'd rather say so than invent a title.
- **General "running LLMs locally" and open-weight-model books/guides** (verify current, well-reviewed titles at time of reading) increasingly include Ollama-specific chapters or sections, given its status as the default local-LLM on-ramp — check recent publication dates specifically, since this exact content area moves quickly.
- **Building Microservices** — Sam Newman. Not Ollama-specific, but the service-boundary and API-design thinking (why a consistent, portable client interface matters across environments) transfers directly to reasoning about Ollama's OpenAI-compatible API design choice.
- **Docker Deep Dive** or similar Docker-focused texts — genuinely useful indirect Ollama reading, since so much of Ollama's own design (CLI verbs, image/layer-style distribution, Dockerfile-inspired Modelfiles) is a direct, deliberate borrowing from Docker's conventions.

The strongest current material for Ollama specifically lives in its own documentation, GitHub discussions, and community tutorial content rather than in books — treat this section as pointing you to durable adjacent foundations rather than Ollama-specific texts that don't yet exist in mature book form.
`,

  blogs: `
- **The Ollama blog** (via its GitHub repository and official site) — release announcements and feature writeups directly from the maintainers.
- **llama.cpp project updates** (via its GitHub repository) — since Ollama tracks and builds on this engine's own progress, following it directly gives useful advance signal on what capabilities may reach Ollama next.
- **Hugging Face blog** — frequently covers local model running (including Ollama) in the context of the broader open-weight model ecosystem.
- **General AI engineering community blogs and newsletters** (search for "running LLMs locally" or "Ollama tutorial" content) — a large volume of high-quality, practically-oriented tutorial content exists here specifically because Ollama's ease of use makes it a popular subject for hands-on writeups.

High-signal filter: prefer posts that show actual commands and measured results (real latency/memory numbers on stated hardware) over posts that only describe features abstractly.
`,

  "research-papers": `
Ollama itself is a developer-tooling and distribution project rather than a research artifact, so there isn't a dedicated academic paper about Ollama specifically — I don't want to invent one that doesn't exist. The genuinely relevant foundational reading is one layer down, in the technology Ollama packages:

- **llama.cpp's own design documentation and technical discussions** (in its GitHub repository) — not a formal paper, but the closest thing to primary-source technical documentation for the actual inference engine underneath Ollama.
- **"GPTQ: Accurate Post-Training Quantization for Generative Pre-trained Transformers"** (Frantar et al., 2022) and **"AWQ: Activation-aware Weight Quantization for LLM Compression and Acceleration"** (Lin et al., 2023) — foundational quantization papers relevant to understanding the accuracy/memory tradeoffs behind the quantized model variants Ollama serves.
- **The GGML/GGUF project's own technical documentation** — the tensor library and file format underlying llama.cpp (and therefore Ollama); worth reading directly for how quantized model files are actually structured.
- **The original PagedAttention paper** (Kwon et al., SOSP 2023, covered in depth in the **vLLM** skill) — valuable contrast reading for understanding exactly what Ollama's local-first design deliberately does not attempt to solve (production-scale concurrent-request memory management).

If a more specific, peer-reviewed "Ollama" paper exists that I'm not aware of, treat that as a gap in my knowledge rather than evidence one doesn't exist — search current academic databases (arXiv) for the latest quantization and efficient-inference research, since that's the actively growing research area underneath tools like Ollama.
`,

  videos: `
- **Ollama's own official YouTube/demo content** (via its GitHub repository links or official site) — the most direct source for current feature walkthroughs from the maintainers.
- **General "run LLMs locally" tutorial videos** across the AI engineering YouTube/content-creator community — an enormous volume of high-quality, practically-oriented walkthrough content exists here specifically because Ollama's low setup friction makes it a popular subject.
- **llama.cpp technical talks and community discussions** — useful for understanding the underlying inference engine's own design and performance characteristics in more depth than Ollama's own abstraction layer typically exposes.
- **Comparison/benchmark videos contrasting Ollama with vLLM or other serving approaches** — search for recent content specifically, since concrete performance numbers and feature comparisons go stale quickly in this fast-moving space.

I don't have high confidence in specific talk titles, speaker names, or exact publication dates for this narrow a topic, and would rather point you to the right channels to search currently than invent a specific citation.
`,

  "github-repos": `
- [ollama/ollama](https://github.com/ollama/ollama) — the project itself; read the docs/ directory and recent release notes for the most current, authoritative detail.
- [ggml-org/llama.cpp](https://github.com/ggml-org/llama.cpp) — the underlying inference engine; essential reading for understanding what Ollama actually wraps and simplifies.
- [ggml-org/ggml](https://github.com/ggml-org/ggml) — the tensor library underlying llama.cpp and the GGUF format itself.
- [vllm-project/vllm](https://github.com/vllm-project/vllm) — the production-serving sibling, valuable direct contrast reading for understanding the concurrency-architecture difference covered in Comparisons.
- [sgl-project/sglang](https://github.com/sgl-project/sglang) — the other production-serving sibling, useful for the same comparative purpose.
- [open-webui/open-webui](https://github.com/open-webui/open-webui) — a popular community web UI frequently paired with Ollama as a local backend, illustrating a common real-world deployment pattern.

Verify current star counts, maintenance activity, and release cadence directly on GitHub before depending on any of these in production — activity levels shift over time.
`,

  "practice-problems": `
**Ordered by skill focus:**

1. *CLI fluency*: pull three different small open-weight models, run each interactively with an identical test prompt, and compare their responses and rough response times on your hardware.
2. *Modelfile authoring*: write Modelfiles for three different personas (a terse assistant, a verbose explainer, a code-only responder) from the same base model, and verify each behaves distinctly on a shared set of test prompts.
3. *API integration*: write a small Python script that calls Ollama via its native API and, separately, via the OpenAI-compatible client, confirming both approaches produce equivalent results for the same prompt.
4. *Quantization tradeoff study*: pull the same model at two quantization levels, measure latency and memory usage for each, and run a small hand-built eval (5-10 representative prompts, graded by hand or with an LLM judge) to observe any quality difference.
5. *Portable client design*: build a client wrapper that reads its backend URL from an environment variable, defaulting to local Ollama, and verify (even with a mocked second backend) that swapping the URL requires zero other code changes.
6. *Resilience*: implement the resilient client pattern from Coding Questions, then deliberately stop the local Ollama server and confirm your error handling produces a clear, actionable message rather than a confusing stack trace.
7. *Local RAG*: build a minimal retrieval-augmented Q&A script using Ollama for both an embedding model and a chat model, entirely on local infrastructure with no external API calls.

External sets: no dedicated public "Ollama problem set" exists that I'm confident recommending by name — the most useful practice is working directly from Ollama's own documentation examples and building toward the labs and coding questions on this page against real models on your own hardware.
`,

  "architecture-diagram": `
The reference local-development architecture built around Ollama, and how it hands off to a production serving engine — the shape this page has built toward throughout:

~~~mermaid
flowchart TB
    subgraph Dev["Local development machine"]
        App["Application code\n(LLM client with configurable base URL)"]
        Ollama["Ollama server\n(localhost:11434)"]
        Modelfile["Version-controlled Modelfile\n(system prompt, parameters)"]
        LlamaCpp["llama.cpp inference engine"]
        GGUF[("Local GGUF model storage")]
    end
    App -->|OLLAMA_BASE_URL=localhost| Ollama
    Ollama --> Modelfile
    Ollama --> LlamaCpp --> GGUF
    subgraph Prod["Production deployment\n(same application code)"]
        GW["API Gateway"]
        VLLM["vLLM or SGLang\nreplica pool"]
    end
    App -.->|LLM_BASE_URL=production endpoint\n(config change only, no code change)| GW --> VLLM
~~~

Every box here maps to a skill on this platform: **llama.cpp** (via the vLLM/SGLang comparison context) is the shared inference-engine lineage; **vLLM** and **SGLang** are where the same portable client code points once production concurrency is the requirement; **Docker** inspired Ollama's own CLI and packaging conventions directly; **AI Evals** validates any Modelfile customization or quantization choice before it's trusted beyond casual local use.
`,

  "mind-map": `
~~~mermaid
mindmap
  root((Ollama))
    The Problem
      Local LLM setup friction
      CUDA and Python environment complexity
      No easy model packaging or sharing
    Core Idea
      Distribution and UX layer
      Built on llama.cpp inference engine
      Docker-inspired design
    Core Concepts
      CLI verbs pull run list rm ps
      Modelfile
      GGUF format
      Automatic GPU CPU offload
    Features
      Native API
      OpenAI-compatible API
      Structured output and function calling
      Multi-modal vision models
      Embeddings
    Internals
      Local server on localhost 11434
      CLI as just another API client
      Hardware detection
      Layer offload decision
    Where It Fits
      Local development
      Quick experimentation
      Offline and edge deployment
      Low-concurrency internal tools
    Where It Does Not Fit
      High-concurrency production serving
      Multi-GPU multi-node scale
      Fine-tuning or training
    Production Discipline
      Version-controlled Modelfiles
      Configurable base URL
      Auth if exposed beyond localhost
      Clear migration point to vLLM SGLang
    Connections
      llama.cpp
      vLLM
      SGLang
      Docker
      Structured Outputs
      AI Evals
~~~
`,
};

export default ollama;
