import type { CheatSheetData } from "./types";

const promptEngineering: CheatSheetData = {
  title: "The Ultimate Prompt Engineering Cheat Sheet",
  subtitle: "Structuring prompts · few-shot · chain-of-thought · structured output · production patterns",
  sections: [
    {
      title: "Core Prompt Anatomy",
      color: "violet",
      rows: [
        { term: "System prompt", desc: "Sets role, tone, constraints — applies to the whole conversation", code: "system: 'You are a support agent. Be concise. Never invent policy.'" },
        { term: "User prompt", desc: "The task/question for this turn", code: "user: 'Summarize this ticket in 2 sentences.'" },
        { term: "Instruction", desc: "The imperative — what you want done", code: "'Extract the invoice number and total as JSON.'" },
        { term: "Context", desc: "The material the model reasons over", code: "'Given the following contract text: ...'" },
        { term: "Output spec", desc: "Format, length, structure constraints", code: "'Respond with exactly 3 bullet points, no preamble.'" },
        { term: "Delimiters", desc: "Separate instructions from data to prevent bleed-through", code: "'''\\nSummarize the text between triple quotes:\\n\\\"\\\"\\\"{doc}\\\"\\\"\\\"'''" },
      ],
    },
    {
      title: "Few-Shot & In-Context Learning",
      color: "blue",
      rows: [
        { term: "Zero-shot", desc: "No examples — relies on model's pretrained/instruction-tuned priors", code: "'Classify sentiment: I loved this movie.' -> positive" },
        { term: "One-shot", desc: "Single example anchors format/style", code: "'Q: 2+2 A: 4\\nQ: 5+7 A:'" },
        { term: "Few-shot", desc: "3-8 examples; the dominant lever for format compliance", code: "'Ex1: input->output\\nEx2: input->output\\nEx3: input->output\\nNow: input->'" },
        { term: "Example diversity", desc: "Cover edge cases, not just the happy path", code: "# include: empty input, ambiguous input, adversarial input" },
        { term: "Example ordering matters", desc: "Recency-biased models weight later examples more", code: "# put the most representative example last" },
        { term: "Diminishing returns", desc: "Beyond ~8-10 examples, fine-tuning usually beats more few-shot", code: "# if you need >10 examples to get consistency,\n# consider fine-tuning instead" },
      ],
    },
    {
      title: "Reasoning Patterns",
      color: "emerald",
      rows: [
        { term: "Chain-of-thought (CoT)", desc: "Ask the model to reason step by step before answering", code: "'Think step by step, then give the final answer on its own line.'" },
        { term: "Zero-shot CoT trigger", desc: "A simple phrase that elicits reasoning without examples", code: "'Let's think through this step by step.'" },
        { term: "Self-consistency", desc: "Sample multiple CoT paths, take the majority answer", code: "answers = [sample(prompt, temp=0.7) for _ in range(5)]\nfinal = majority_vote(answers)" },
        { term: "Least-to-most prompting", desc: "Decompose a hard problem into ordered sub-problems first", code: "'First list the sub-steps needed, then solve each in order.'" },
        { term: "ReAct pattern", desc: "Interleave reasoning traces with tool actions", code: "Thought: I need the current price.\nAction: search('AAPL stock price')\nObservation: ...\nThought: ..." },
        { term: "Reasoning != guaranteed correctness", desc: "CoT improves consistency, doesn't eliminate hallucination", code: "# always validate CoT-derived answers against\n# a ground truth or a second check" },
      ],
    },
    {
      title: "Structured Output",
      color: "amber",
      rows: [
        { term: "JSON mode / schema constraint", desc: "Force syntactically valid JSON via API-level constrained decoding", code: "response_format={'type': 'json_schema', 'json_schema': schema}" },
        { term: "Explicit schema in prompt", desc: "Show the exact shape you want, including types", code: "'Return JSON: {\\\"name\\\": string, \\\"age\\\": number}'" },
        { term: "Pydantic-validated output", desc: "Parse then validate; retry on failure", code: "try:\n    Invoice.model_validate_json(raw)\nexcept ValidationError:\n    retry_with_error_feedback(raw)" },
        { term: "Retry-with-error prompting", desc: "Feed the validator's error back to the model to self-correct", code: "'Your last output failed validation: {error}. Fix and resend JSON only.'" },
        { term: "No-prose constraint", desc: "Explicitly forbid explanation text around structured output", code: "'Return only the JSON object. No markdown, no commentary.'" },
      ],
    },
    {
      title: "Production Patterns",
      color: "rose",
      rows: [
        { term: "Prompt templates", desc: "Parameterize prompts; never string-concat user input directly", code: "template = 'Summarize: {doc}'\nprompt = template.format(doc=sanitize(user_doc))" },
        { term: "Prompt injection risk", desc: "Untrusted content in context can override instructions", code: "# treat retrieved/user content as DATA, not instructions;\n# use delimiters + reiterate system rules after context" },
        { term: "Versioning prompts", desc: "Track prompt changes like code — diff, review, roll back", code: "prompts/summarize_v3.txt  # git-tracked, changelog per version" },
        { term: "A/B testing prompts", desc: "Measure task success rate, not just 'looks good'", code: "eval_set = load_golden_examples()\nscore_v2 = run_eval(prompt_v2, eval_set)\nscore_v3 = run_eval(prompt_v3, eval_set)" },
        { term: "Temperature for determinism", desc: "Lower temperature for extraction/classification tasks", code: "temperature=0  # near-deterministic, best for structured tasks" },
        { term: "Length/cost control", desc: "Cap output tokens explicitly to bound latency and cost", code: "max_tokens=200  # don't rely on the model to self-limit" },
      ],
    },
    {
      title: "Common Pitfalls",
      color: "cyan",
      rows: [
        { term: "Vague instructions", desc: "'Make it better' has no measurable target", code: "# BAD: 'Improve this email'\n# GOOD: 'Shorten to 3 sentences, keep the ask in bold'" },
        { term: "Overloading one prompt", desc: "Too many tasks in one call degrades quality on all of them", code: "# split 'summarize + translate + classify' into\n# separate calls or a pipeline" },
        { term: "Ignoring model-specific quirks", desc: "Prompts tuned for one model family may not transfer", code: "# re-validate prompts against your eval set\n# whenever you switch model providers/versions" },
        { term: "No eval set", desc: "Tweaking prompts by vibes instead of measured regression tests", code: "# maintain a golden set of (input, expected) pairs\n# re-run on every prompt change" },
        { term: "Prompting instead of fine-tuning/RAG", desc: "Cramming a knowledge base into every prompt doesn't scale", code: "# large static knowledge -> RAG\n# consistent narrow behavior at volume -> fine-tuning" },
      ],
    },
  ],
};

export default promptEngineering;
