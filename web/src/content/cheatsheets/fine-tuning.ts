import type { CheatSheetData } from "./types";

const fineTuning: CheatSheetData = {
  title: "The Ultimate Fine-Tuning Cheat Sheet",
  subtitle: "LoRA/QLoRA · full fine-tuning · data prep · hyperparameters · when NOT to fine-tune",
  sections: [
    {
      title: "When Fine-Tuning Is the Right Tool",
      color: "violet",
      rows: [
        { term: "Fine-tuning changes WHAT the model IS", desc: "vs. prompting/RAG which change what it SEES at inference", code: "# weights updated, behavior baked in permanently" },
        { term: "Good fit: style/format consistency", desc: "House tone, structured output habits, narrow classification", code: "# e.g. always respond in a specific JSON schema\n# without needing to re-specify it every prompt" },
        { term: "Bad fit: injecting new facts", desc: "Static knowledge is RAG's job, not fine-tuning's", code: "# fine-tuning on facts often causes memorization\n# artifacts and doesn't update cleanly" },
        { term: "Decision order", desc: "Try prompting -> try RAG -> only then fine-tune", code: "if prompting_solves_it: stop()\nelif rag_solves_it: stop()\nelse: consider_fine_tuning()" },
        { term: "Fine-tuning is data-quality dominated", desc: "100 excellent examples beat 10,000 noisy ones", code: "# audit every example manually before a first run" },
      ],
    },
    {
      title: "LoRA / QLoRA (Parameter-Efficient)",
      color: "blue",
      rows: [
        { term: "LoRA", desc: "Freeze base weights, train small low-rank adapter matrices", code: "W' = W + BA   # B: d x r, A: r x k, r << d,k" },
        { term: "Rank (r)", desc: "Adapter capacity knob — higher r = more capacity, more memory", code: "lora_config = LoraConfig(r=16, lora_alpha=32)" },
        { term: "QLoRA", desc: "LoRA on top of a 4-bit quantized base model — trains on a single GPU", code: "model = AutoModelForCausalLM.from_pretrained(\n  name, load_in_4bit=True, device_map='auto')" },
        { term: "Target modules", desc: "Which layers get adapters — usually attention projections", code: "target_modules=['q_proj', 'v_proj']" },
        { term: "Merging adapters", desc: "Fold LoRA weights back into base weights for deployment", code: "merged = model.merge_and_unload()" },
        { term: "Why LoRA won", desc: "~1% of full fine-tuning's trainable params, comparable quality", code: "# full FT: update all N params\n# LoRA: update r*(d+k) << N params" },
      ],
    },
    {
      title: "Data Preparation",
      color: "emerald",
      rows: [
        { term: "Instruction format", desc: "Consistent input/output structure the model will learn to mimic", code: "{'instruction': '...', 'input': '...', 'output': '...'}" },
        { term: "Chat format", desc: "Multi-turn training data mirrors deployment format exactly", code: "[{'role':'system',...},{'role':'user',...},{'role':'assistant',...}]" },
        { term: "Minimum viable dataset size", desc: "Often 50-500 high-quality examples for narrow tasks via LoRA", code: "# start small, measure, add more only if eval shows gaps" },
        { term: "Train/val split", desc: "Hold out validation examples never used in training", code: "train, val = split(dataset, ratio=0.9)" },
        { term: "Dedup and dedent", desc: "Remove near-duplicate examples that overweight one pattern", code: "dataset = dedupe_by_similarity(dataset, threshold=0.95)" },
        { term: "Label leakage check", desc: "Ensure the answer isn't trivially derivable from the input alone", code: "# manually inspect a sample for shortcuts" },
      ],
    },
    {
      title: "Training & Hyperparameters",
      color: "amber",
      rows: [
        { term: "Learning rate", desc: "LoRA typically uses higher LR than full fine-tuning", code: "learning_rate=2e-4  # LoRA; full FT often ~1e-5" },
        { term: "Epochs", desc: "Small datasets need few epochs — overfitting risk is high", code: "num_train_epochs=3  # watch val loss for overfitting" },
        { term: "Batch size + gradient accumulation", desc: "Simulate larger batches on limited GPU memory", code: "per_device_train_batch_size=4\ngradient_accumulation_steps=8  # effective batch = 32" },
        { term: "Early stopping", desc: "Stop when validation loss stops improving", code: "EarlyStoppingCallback(early_stopping_patience=2)" },
        { term: "Catastrophic forgetting", desc: "Overfitting narrows general capability", code: "# mix in a small % of general-instruction examples\n# to preserve broad capability" },
      ],
    },
    {
      title: "Evaluation & Deployment",
      color: "rose",
      rows: [
        { term: "Held-out eval set", desc: "Never used in training; measures real generalization", code: "score = evaluate(model, held_out_set)" },
        { term: "Compare to baseline", desc: "Always measure fine-tuned vs. prompted-base-model on the same eval", code: "delta = score(fine_tuned) - score(prompted_base)\n# if delta is small, fine-tuning wasn't worth it" },
        { term: "Task-specific metrics", desc: "Exact match, F1, or human rubric — not just training loss", code: "# training loss going down != task quality going up" },
        { term: "Serving LoRA adapters", desc: "Swap adapters per-tenant/task without duplicating the base model", code: "vllm.LLM(model=base, enable_lora=True)\n# load multiple adapters at request time" },
        { term: "Re-fine-tune cadence", desc: "Refresh when base model updates or task drifts", code: "# treat the fine-tuned model like a versioned artifact" },
      ],
    },
    {
      title: "Common Pitfalls",
      color: "cyan",
      rows: [
        { term: "Fine-tuning to fix a prompting bug", desc: "Cheaper to fix the prompt first", code: "# always rule out a prompt fix before training" },
        { term: "Too few, too repetitive examples", desc: "Model memorizes surface patterns instead of generalizing", code: "# add variety in phrasing, length, edge cases" },
        { term: "No baseline comparison", desc: "Can't tell if fine-tuning actually helped", code: "# always A/B against the un-tuned model" },
        { term: "Ignoring cost of full fine-tuning", desc: "Full FT needs far more GPU memory than most teams have access to", code: "# default to LoRA/QLoRA unless you have a specific\n# reason full fine-tuning is required" },
        { term: "Skipping data audits", desc: "Bad labels in training data reliably produce bad models", code: "# manually review a random sample before every training run" },
      ],
    },
  ],
};

export default fineTuning;
