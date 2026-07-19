import type { CheatSheetData } from "./types";

const servingCheatSheet: CheatSheetData = {
  title: "Serving",
  subtitle: "vLLM, TGI, and LLM serving infrastructure",
  sections: [
    {
      title: "Serving = Inference + System",
      color: "violet",
      rows: [
        { term: "Stack", desc: "API layer -> queue/admission -> continuous batching -> inference engine" },
        { term: "Dedicated engines", desc: "vLLM, TGI — KV cache + PagedAttention built in" },
      ],
    },
    {
      title: "GPU Autoscaling",
      color: "blue",
      rows: [
        { term: "Why it's different", desc: "Expensive hardware + meaningful model-load/provisioning time" },
        { term: "Cold start", desc: "Time to load model weights into GPU memory before serving" },
        { term: "Predictive scaling", desc: "Pre-provision for known traffic cycles" },
        { term: "Buffer capacity", desc: "Absorbs genuine, unpredictable spikes" },
        { term: "Minimum warm instances", desc: "Avoids severe cold-start latency" },
      ],
    },
    {
      title: "Admission Control",
      color: "emerald",
      rows: [
        {
          term: "Bounded queue",
          desc: "Explicit rejection when full — never silent drop",
          code: "if queue.full(): return 503  # graceful, not silent degradation",
        },
      ],
    },
    {
      title: "LLM-Specific Observability",
      color: "amber",
      rows: [
        { term: "Time-to-first-token", desc: "Prefill-phase latency" },
        { term: "Tokens-per-second", desc: "Decode-phase throughput" },
        { term: "GPU utilization/memory", desc: "Resource efficiency signal" },
        { term: "Queue depth", desc: "Capacity vs demand signal" },
      ],
    },
    {
      title: "Multi-Model Serving",
      color: "rose",
      rows: [
        { term: "Multi-LoRA adapters", desc: "One frozen base model + swap small adapters per request" },
      ],
    },
    {
      title: "Self-Hosted vs Managed",
      color: "cyan",
      rows: [
        { term: "Self-hosted (vLLM/TGI)", desc: "Customization/data-residency needs, more ops burden" },
        { term: "Managed API", desc: "Lower ops burden, faster time-to-production" },
      ],
    },
  ],
};

export default servingCheatSheet;
