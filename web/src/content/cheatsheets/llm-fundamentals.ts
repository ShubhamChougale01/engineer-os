import type { CheatSheetData } from "./types";

const llmFundamentals: CheatSheetData = {
  title: "The Ultimate LLM Fundamentals Cheat Sheet",
  subtitle: "Tokens · context window · sampling · training pipeline · production essentials",
  sections: [
    {
      title: "Core Definition & Objective",
      color: "violet",
      rows: [
        { term: "LLM", desc: "Transformer decoder trained to predict the next token given prior tokens", code: "input: \"The sky is\"\noutput: prob dist over vocab\n  \"blue\" -> 0.71, \"dark\" -> 0.09 ..." },
        { term: "Autoregressive generation", desc: "Each new token conditions on all tokens generated so far", code: "loop:\n  logits = forward(tokens_so_far)\n  next_token = sample(logits)\n  tokens_so_far += next_token" },
        { term: "Why capability emerges", desc: "Predicting next tokens well over huge diverse text forces the model to internalize grammar, facts, code, reasoning patterns", code: "no hand-coded rules --\nregularities learned implicitly\nfrom the training distribution" },
        { term: "No built-in fact-checker", desc: "Objective rewards plausibility, not verified truth -- root cause of hallucination", code: "fluent output != correct output\nsee: Hallucination skill" },
        { term: "Decoder-only transformer", desc: "Stack of self-attention + feed-forward layers with causal masking", code: "token i can attend to\n  tokens 1..i only (not future)" },
        { term: "Prerequisite skills", desc: "This page builds on architecture already covered elsewhere", code: "see: Transformers, Attention,\n     Embeddings skills" },
      ],
    },
    {
      title: "Tokenization",
      color: "blue",
      rows: [
        { term: "Subword tokens", desc: "Not characters (too fine), not whole words (infinite vocab) -- learned pieces", code: "\"Tokenization\" ->\n  [\"Token\", \"ization\"]" },
        { term: "BPE (Byte-Pair Encoding)", desc: "Start from characters, iteratively merge most frequent adjacent pair", code: "l o w -> lo w -> low\n(merge repeated until vocab size)" },
        { term: "Worked tokenization example", desc: "Common words = 1 token; rare/compound words split", code: "\"isn't always intuitive.\"\n-> [\" isn\", \"'t\", \" always\",\n    \" intuit\", \"ive\", \".\"]" },
        { term: "Measure tokens correctly", desc: "Always use the real tokenizer for your target model, never word-count heuristics", code: "import tiktoken\nenc = tiktoken.get_encoding(\"cl100k_base\")\nlen(enc.encode(text))" },
        { term: "Whitespace matters", desc: "\"Paris\" and \" Paris\" (leading space) are often different tokens", code: "reformatting text can silently\nchange token count" },
        { term: "Non-English / code cost more", desc: "Tokenizer vocab often built English-heavy -- other languages tokenize less efficiently", code: "same idea, more tokens ->\nhigher cost in other languages" },
        { term: "Digits tokenize oddly", desc: "Numbers often split per-digit or per-few-digits -- not one semantic unit", code: "\"48213\" may become\n[\"482\", \"13\"] or similar" },
        { term: "Detokenization", desc: "Output token IDs are converted back to text after generation", code: "enc.decode(token_ids) -> text" },
      ],
    },
    {
      title: "Context Window",
      color: "emerald",
      rows: [
        { term: "Context window, precisely", desc: "Max number of tokens the model can jointly attend to in one forward pass", code: "input tokens + output tokens\n  share ONE shared budget" },
        { term: "Not \"memory\" in a human sense", desc: "It's a hard architectural ceiling, not a soft inconvenience", code: "exceed it -> request rejected\nor earliest content silently drops" },
        { term: "Quadratic attention cost", desc: "Self-attention scores every token pair -- cost grows roughly with length squared", code: "2x context length ->\n  ~4x attention compute" },
        { term: "Budget explicitly", desc: "Allocate tokens across system prompt, history, retrieved context, reserved response", code: "used = sys + history + input\navailable = max_ctx - used" },
        { term: "Trimming strategies", desc: "Drop oldest history first (simple) or summarize dropped history (better)", code: "while sum(history) > budget:\n    history.pop(0)  # oldest first" },
        { term: "Long context != free", desc: "Real cost and latency tradeoff -- consider retrieval instead of \"send everything\"", code: "see: Cost Optimization,\n     Latency skills" },
      ],
    },
    {
      title: "Sampling & Generation",
      color: "amber",
      rows: [
        { term: "Temperature", desc: "Divides logits before softmax -- reshapes randomness of output", code: "scaled = [x / temperature for x in logits]\nprobs = softmax(scaled)" },
        { term: "Low temperature (near 0)", desc: "Sharpens toward the single most likely token -- near-deterministic", code: "temp=0.0 -> consistent,\n  \"expected\" phrasing" },
        { term: "High temperature (>1)", desc: "Flattens distribution -- more variety, more risk of incoherence", code: "temp=1.3 -> surprising,\n  occasionally less coherent" },
        { term: "Top-k sampling", desc: "Keep only the k highest-probability tokens, discard the rest", code: "keep top k logits,\nrenormalize, then sample" },
        { term: "Top-p / nucleus sampling", desc: "Keep smallest top set whose cumulative probability reaches p -- adapts per step", code: "sort desc by prob\nkeep until cumulative >= p\nrenormalize remaining" },
        { term: "Same prompt, 3 temperatures", desc: "Worked example: coherence vs variety tradeoff", code: "temp 0.0: expected phrasing\ntemp 0.7: varied, coherent\ntemp 1.3: high variance, risky" },
        { term: "Task-appropriate defaults", desc: "Consistency tasks want low temp; creative tasks want higher temp", code: "extraction/code -> temp near 0\nbrainstorming -> temp 0.7-1.2" },
        { term: "KV cache", desc: "Caches earlier keys/values so each new token doesn't recompute the whole prefix", code: "avoids O(n^2) recompute\nper generated token" },
      ],
    },
    {
      title: "Training Pipeline & Disputed Topics",
      color: "rose",
      rows: [
        { term: "Pretraining", desc: "Next-token prediction over massive broad corpus -- bulk of compute, general capability", code: "self-supervised, no labels\nmost of the knowledge comes here" },
        { term: "Instruction tuning", desc: "Supervised fine-tuning on instruction/response examples -- teaches obedience to directions", code: "input: instruction\ntarget: good response" },
        { term: "RLHF / preference optimization", desc: "Human preference ranking used to further align behavior (helpful, honest, safe)", code: "reward model or direct\npreference optimization" },
        { term: "Base model", desc: "Raw pretraining output -- continues text plausibly, no instruction-following tendency", code: "\"Write a poem\" may continue\nas a list of homework prompts" },
        { term: "Instruction-tuned / chat model", desc: "Base model + instruction tuning + RLHF -- behaves like an assistant", code: "same underlying architecture,\ndifferent training phase applied" },
        { term: "Scaling laws (hedge!)", desc: "Empirical trend: performance improves smoothly with more params/data/compute", code: "observed trend in specific\nstudies -- NOT a universal law" },
        { term: "Emergent capabilities (hedge!)", desc: "DISPUTED -- may be partly an artifact of all-or-nothing evaluation metrics", code: "state both sides; never\nclaim this is settled fact" },
        { term: "Never invent numbers", desc: "Don't cite specific scaling exponents or benchmark scores you haven't verified", code: "verify against current\nprovider docs / papers" },
      ],
    },
    {
      title: "Production & Sibling Skills",
      color: "cyan",
      rows: [
        { term: "Pin model versions", desc: "Never float to \"latest\" silently in production", code: "LLM_MODEL=<exact pinned version>\nre-run eval before upgrading" },
        { term: "Cost begins at the tokenizer", desc: "Verbose templates and long context are recurring costs, not one-time ones", code: "measure tokens per request\nand per feature" },
        { term: "Guardrails, both sides", desc: "Filter untrusted input AND validate/filter model output", code: "input: trust separation\noutput: schema validation" },
        { term: "Never trust output blindly", desc: "Validate structure before using LLM output programmatically", code: "assert \"field\" in result\nassert isinstance(x, (int,float))" },
        { term: "Prompt injection risk", desc: "Untrusted retrieved/user content can smuggle in instructions the model may follow", code: "separate trusted system\ninstructions from untrusted text" },
        { term: "Prompt Engineering", desc: "Sibling skill: reliable behavior WITHOUT changing the model", code: "instructions, few-shot,\nsampling-parameter tuning" },
        { term: "Fine-Tuning", desc: "Sibling skill: deliberately changing the model's weights", code: "instruction tuning, RLHF,\nparameter-efficient methods" },
        { term: "Inference / Serving", desc: "Sibling skills: running the model efficiently as production infrastructure", code: "KV-cache, batching,\nquantization, routing" },
        { term: "Evaluation", desc: "Sibling skill: measuring whether outputs are actually good", code: "benchmarks, human eval,\nregression testing" },
        { term: "Hallucination", desc: "Sibling skill: the confident-but-false output failure mode and mitigations", code: "retrieval grounding,\ncitations, verification steps" },
      ],
    },
  ],
};

export default llmFundamentals;
