import type { CheatSheetData } from "./types";

const ollama: CheatSheetData = {
  title: "The Ultimate Ollama Cheat Sheet",
  subtitle: "One-command local models · Modelfiles · OpenAI-compatible API · dev-to-prod portability",
  sections: [
    {
      title: "Core Concepts",
      color: "violet",
      rows: [
        { term: "Ollama", desc: "Tool for running open-weight LLMs locally with one command", code: "ollama run llama3.1" },
        { term: "llama.cpp relationship", desc: "Ollama is a UX/distribution layer over llama.cpp's inference engine", code: "same relationship as Docker\nto Linux container primitives" },
        { term: "Modelfile", desc: "Dockerfile-inspired config: system prompt, params, template", code: "FROM llama3.1\nSYSTEM \"You are terse.\"\nPARAMETER temperature 0.3" },
        { term: "GGUF", desc: "Model file format bundling weights + quantization metadata", code: "the format used by llama.cpp underneath" },
        { term: "Ollama's model library", desc: "Curated, growing set of pre-converted open-weight models", code: "ollama pull mistral\nollama pull llama3.1:70b" },
        { term: "Docker-inspired CLI", desc: "pull/run/list/rm deliberately mirror docker's own verbs", code: "ollama pull <model>\nollama run <model>\nollama list\nollama rm <model>" },
        { term: "OpenAI-compatible endpoint", desc: "Existing OpenAI client code points at Ollama with minimal changes", code: "base_url='http://localhost:11434/v1'" },
        { term: "Fully local inference", desc: "No prompt/response data leaves the machine once the model is pulled", code: "meaningful privacy / data-residency advantage" },
      ],
    },
    {
      title: "Setup & Config",
      color: "blue",
      rows: [
        { term: "ollama pull", desc: "Download a model without running it", code: "ollama pull mistral" },
        { term: "ollama run", desc: "Download (if needed) and run interactively", code: "ollama run llama3.1" },
        { term: "ollama list / ps / rm", desc: "Manage local disk and loaded-model memory footprint", code: "ollama list   # downloaded models\nollama ps     # currently loaded\nollama rm x   # free disk space" },
        { term: "Quantization tags", desc: "Pull a specific precision level explicitly", code: "ollama pull llama3.1:8b-instruct-q4_K_M\nollama pull llama3.1:8b-instruct-q8_0" },
        { term: "num_ctx", desc: "Context-window memory reserved for a model", code: "PARAMETER num_ctx 8192\n# size to actual need, not the max" },
        { term: "GPU/CPU auto-offload", desc: "Ollama detects VRAM and decides the layer split automatically", code: "check with: ollama ps / nvidia-smi" },
        { term: "ollama create", desc: "Build a new named model from a Modelfile", code: "ollama create terse-assistant -f ./Modelfile" },
      ],
    },
    {
      title: "Everyday Idioms",
      color: "emerald",
      rows: [
        { term: "Native API call", desc: "Raw HTTP request to the local server", code: "requests.post('http://localhost:11434/api/generate',\n  json={'model':'llama3.1','prompt':'hi','stream':False})" },
        { term: "OpenAI client call", desc: "Standard client library pointed at Ollama", code: "client = OpenAI(base_url='http://localhost:11434/v1',\n  api_key='ollama')\nclient.chat.completions.create(model='llama3.1', ...)" },
        { term: "Streaming", desc: "Read tokens incrementally, same shape as OpenAI streaming", code: "for chunk in client.chat.completions.create(..., stream=True):\n    print(chunk.choices[0].delta.content, end='')" },
        { term: "Always set a timeout", desc: "Even a local call deserves one -- a stuck model shouldn't hang your app", code: "client.chat.completions.create(..., timeout=30)" },
        { term: "Structured JSON output", desc: "Constrain output to valid JSON via response_format", code: "response_format={'type': 'json_object'}" },
        { term: "Local embeddings", desc: "Serve embedding models for a fully local RAG pipeline", code: "requests.post('.../api/embeddings',\n  json={'model':'nomic-embed-text','prompt':text})" },
        { term: "Multi-modal (vision)", desc: "Include a base64 image alongside a text prompt", code: "json={'model':'llava','prompt':'describe',\n  'images':[image_b64]}" },
      ],
    },
    {
      title: "Power Features",
      color: "amber",
      rows: [
        { term: "Custom system prompt + params", desc: "Package a persona/task-specific model as a shareable artifact", code: "SYSTEM \"You are a Python coding assistant.\"\nPARAMETER temperature 0.2" },
        { term: "Custom prompt TEMPLATE", desc: "Control the exact prompt format sent to the model", code: "TEMPLATE \"...{{ .System }}...{{ .Prompt }}...\"" },
        { term: "Bring-your-own GGUF", desc: "Import a custom/fine-tuned checkpoint via a local file path", code: "FROM ./my-fine-tune.gguf" },
        { term: "Function/tool calling", desc: "OpenAI-compatible tool calls for models that support it", code: "client.chat.completions.create(..., tools=[...])" },
        { term: "Portable client pattern", desc: "Same code targets local Ollama in dev, vLLM/SGLang in prod", code: "base_url = os.environ.get('LLM_BASE_URL',\n  'http://localhost:11434/v1')" },
        { term: "Model sharing", desc: "Push a customized model to a registry, like a custom Docker image", code: "ollama create my-model -f Modelfile\n# ollama push my-model (to a registry)" },
      ],
    },
    {
      title: "Pitfalls & Gotchas",
      color: "rose",
      rows: [
        { term: "Treating Ollama as a production engine", desc: "Its design center is single-user/low concurrency, not scale", code: "# WRONG: serve hundreds of concurrent users on Ollama\n# RIGHT: use vLLM or SGLang for real production concurrency" },
        { term: "No auth by default", desc: "Assumes a trusted single local user", code: "# don't bind to 0.0.0.0 without adding\n# a real authenticating gateway in front" },
        { term: "Hardcoding localhost", desc: "Defeats the whole point of a portable client", code: "# WRONG: base_url='http://localhost:11434/v1' (fixed)\n# RIGHT: read from an env var, default to local" },
        { term: "Largest quantization 'to be safe'", desc: "Can thrash memory if it doesn't actually fit", code: "# choose a level that fits YOUR hardware\n# with headroom, not just the highest fidelity" },
        { term: "No client-side timeout", desc: "Local doesn't mean immune to hangs", code: "# WRONG: client.chat.completions.create(model=m, messages=msgs)\n# RIGHT: create(..., timeout=30)" },
        { term: "Modelfiles not version-controlled", desc: "Loses reproducibility of the exact local config used", code: "# commit Modelfile alongside app code" },
        { term: "Assuming GPU offload happened", desc: "Silent CPU fallback after a driver/config change", code: "# verify with ollama ps / nvidia-smi,\n# don't just assume acceleration is active" },
        { term: "Skipping evals on customization", desc: "A system-prompt or quantization change is a behavior change", code: "# validate against a small eval set,\n# same discipline as any prompt change" },
      ],
    },
    {
      title: "Production Toolbelt",
      color: "cyan",
      rows: [
        { term: "Containerized Ollama", desc: "For small internal tools or reproducible dev environments", code: "FROM ollama/ollama:latest\nEXPOSE 11434\nCMD [\"serve\"]" },
        { term: "Persist models across restarts", desc: "Named volume avoids re-pulling multi-GB downloads", code: "volumes:\n  - ollama_models:/root/.ollama" },
        { term: "GPU passthrough (compose)", desc: "Give the container access to hardware acceleration", code: "deploy:\n  resources:\n    reservations:\n      devices:\n        - driver: nvidia" },
        { term: "Migration signal", desc: "Benchmark before assuming Ollama scales to your concurrency", code: "measured need > Ollama's realistic ceiling\n-> migrate to vLLM / SGLang" },
        { term: "vLLM / SGLang tie-in", desc: "The production-serving siblings once concurrency scale is the need", code: "# see the vLLM and SGLang skills --\n# same OpenAI-compatible surface" },
        { term: "AI Evals tie-in", desc: "Validate Modelfile customizations and quantization choices", code: "# treat as a behavior change,\n# not just a config tweak" },
        { term: "Secrets Management tie-in", desc: "If exposed beyond localhost, credentials need real handling", code: "# see Secrets Management skill" },
      ],
    },
  ],
};

export default ollama;
