import type { SkillContent } from "../types";

/**
 * Fine-Tuning — full 50-section knowledge page.
 * Code blocks use ~~~ fences (never backticks). No backtick characters and
 * no ${ sequences appear anywhere in this file's string content.
 */
const fineTuning: SkillContent = {
  overview: `
Fine-tuning is the process of continuing the training of an already-pretrained language model on a smaller, task-specific dataset so it internalizes a particular style, format, tone, or domain behavior more reliably than prompting alone can achieve. Instead of starting from random weights, fine-tuning starts from a model that already knows language, reasoning patterns, and world knowledge from massive pretraining, and nudges its weights toward a narrower distribution of desired behavior.

For an AI engineer, fine-tuning is one lever among several — prompting, retrieval-augmented generation (RAG), and fine-tuning — for shaping model behavior, and it is the lever most engineers reach for too early. The core discipline this skill teaches is not "how do I run a training job" (that part is mostly library calls), but "when is fine-tuning actually the right tool, and when is it an expensive way to solve a problem RAG or a better prompt would have solved for a tenth of the cost." Fine-tuning changes what the model IS; prompting and RAG change what the model SEES at inference time. That distinction drives almost every decision in this page.

Key characteristics: it is supervised (usually) on curated input/output pairs, it modifies model weights (fully or partially), it is data-quality-dominated more than almost any other part of the ML stack, and in modern practice it is almost always done with parameter-efficient techniques like LoRA and QLoRA rather than full fine-tuning, because full fine-tuning of a modern large language model requires memory and compute most teams do not have and rarely need. Done well, fine-tuning produces smaller, cheaper, more consistent models for a narrow job — a specialized classifier, a house-style writing assistant, a structured-output extractor — that outperform a much larger general model prompted from scratch on that same narrow job.
`,

  history: `
Fine-tuning as a general deep-learning idea predates LLMs by a decade: computer vision practitioners were fine-tuning ImageNet-pretrained CNNs (take a network trained on 1.2M images, retrain the last layers on a small custom dataset) since the early 2010s. The NLP version of "pretrain then fine-tune" became mainstream with transfer learning for text.

| Year | Milestone |
|------|-----------|
| 2015–2017 | Transfer learning matures in vision (fine-tuning pretrained CNNs becomes standard practice) |
| 2018 | ULMFiT and BERT popularize pretrain-then-fine-tune for NLP; fine-tuning BERT on a downstream task becomes the default recipe |
| 2018–2019 | GPT and GPT-2 show fine-tuning plus later prompting both work, opening the "which lever do I pull" question |
| 2020 | GPT-3 shows large models can perform tasks from prompting alone (few-shot, in-context learning) without any weight updates — this is the moment prompting became a real alternative to fine-tuning |
| 2021 | LoRA (Low-Rank Adaptation) paper published by Hu et al. at Microsoft — the single most influential efficiency idea for adapting large models cheaply |
| 2022 | InstructGPT/RLHF popularized: fine-tuning plus human-feedback-based reinforcement learning to align base models to follow instructions — this is the recipe behind ChatGPT |
| 2023 | QLoRA (Dettmers et al.) combines 4-bit quantization with LoRA, making fine-tuning of tens-of-billions-of-parameter models feasible on a single consumer or prosumer GPU |
| 2023 | Direct Preference Optimization (DPO) proposed as a simpler, more stable alternative to full RLHF pipelines for preference alignment |
| 2023–2024 | Hosted fine-tuning APIs (OpenAI fine-tuning API, Together, Fireworks, Anthropic's early access programs) make fine-tuning accessible without owning GPUs |
| 2024–2025 | PEFT libraries (Hugging Face PEFT, Axolotl, Unsloth) standardize LoRA/QLoRA workflows; instruction-tuned open-weight model families (Llama, Mistral, Qwen) become common fine-tuning bases |

The throughline: as base models got more capable, the reasons to do full fine-tuning shrank, and the reasons to do cheap, targeted, low-rank adaptation on top of a frozen base grew. This page's honest position is downstream of that history.
`,

  "why-it-exists": `
Fine-tuning exists because of a gap between what a general pretrained model knows and what a specific application needs it to reliably DO.

Before fine-tuning (or in situations where teams skip it and shouldn't), engineers faced:

- **Prompt fragility for style and format**: a base or general chat model can be told "always respond in this exact JSON schema" or "always write in this brand voice," but under long conversations, edge-case inputs, or adversarial users, prompt-only instructions drift. The instruction competes with context for the model's attention every single call.
- **Repeated few-shot cost**: getting consistent behavior via prompting often means stuffing many examples into every request — burning tokens, latency, and money on every single call, forever.
- **Narrow-task inefficiency**: using a large, expensive, general-purpose model to do one repetitive narrow job (classify support tickets into 12 categories, extract five fields from an invoice) is using a Swiss Army knife when a scalpel would be faster, cheaper, and more consistent.

Fine-tuning exists to convert "I have to tell the model this every time" into "the model already behaves this way by default." It moves the cost from every inference call (longer prompts, more tokens, more chance of drift) to a one-time training step, and it can distill a narrow skill into a much smaller model than would be needed to get the same reliability purely through prompting a general model. It does NOT exist to give a model facts it doesn't already know reliably — that is a knowledge-injection problem, and RAG is the tool built for that (see Problem It Solves below and the decision framework in Advanced Concepts).
`,

  "problem-it-solves": `
Fine-tuning concretely solves:

- **Consistency of style, tone, and format** — a support bot that must always match brand voice, a code assistant that must always emit a specific commit-message format, a classifier that must always emit one of N labels with no free text.
- **Domain-specific behavior patterns** — teaching a model the conventions of a narrow domain (legal clause drafting patterns, a company's internal ticket triage rubric, a specific coding style guide) that would take an enormous, fragile prompt to specify every time.
- **Latency and cost at scale** — replacing "large general model + long few-shot prompt" with "small fine-tuned model + short prompt" for a high-volume narrow task, because you no longer need in-context examples to get the behavior.
- **Structured/constrained output reliability** — a model fine-tuned on thousands of examples of a JSON schema tends to emit that schema far more reliably than one merely told about it in a system prompt.

**What fine-tuning deliberately does NOT solve** — and this is the single most important honest statement on this page:

- **Injecting new factual knowledge reliably.** Fine-tuning on a document set does not reliably teach a model new facts it can then recall accurately on demand; it tends to make the model MORE fluent and confident about the domain's style while facts get partially memorized, partially blended, and partially hallucinated. If you need the model to answer questions using current, verifiable, or frequently-changing facts, that is what RAG (retrieval-augmented generation) is for — retrieve the actual source at inference time and let the model read it, rather than hoping training baked it in. Confusing these two is the single most common and costly mistake teams make with fine-tuning: they spend weeks curating a fine-tuning dataset of internal documents hoping the model will "learn the company's knowledge base," and end up with a model that is stylistically fluent in the domain but still confabulates specific facts, prices, and policies — because none of that was reliably encoded by gradient descent on a few thousand examples. See the **LLM Fundamentals** skill for why next-token prediction training does not equal reliable fact storage, and the **Prompt Engineering** and **RAG** territory for the alternative levers.
- **Fixing a fundamentally wrong model choice.** Fine-tuning a small model that lacks the reasoning capacity for a task will not grant it reasoning capacity — it will just make it fluently wrong in the target style.
- **Replacing evaluation.** A fine-tuned model still needs rigorous, ongoing evaluation; fine-tuning does not eliminate the risk of regressions, bias, or unsafe outputs — see Security and Testing.
`,

  "learning-objectives": `
By the end of this page you should be able to:

1. Explain, with a clear decision framework, when fine-tuning is justified versus when prompt engineering or RAG is the correct and cheaper choice.
2. Distinguish full fine-tuning from parameter-efficient fine-tuning (PEFT) and explain why PEFT dominates real-world practice.
3. Explain the mechanics of LoRA — frozen base weights plus trainable low-rank update matrices — and why low-rank updates are often sufficient to adapt a large model.
4. Explain QLoRA and how quantization plus LoRA further reduces memory requirements.
5. Walk through the end-to-end SFT (supervised fine-tuning) pipeline: dataset curation, formatting, training, evaluation.
6. Describe RLHF and DPO at a conceptual level and articulate honest uncertainty about which specific alignment technique is currently most common in industry.
7. Write a conceptual LoRA fine-tuning script using the PEFT/transformers stack, including the training loop shape.
8. Identify catastrophic forgetting as a real risk of fine-tuning and describe mitigations.
9. Explain why dataset quality is the dominant success factor in fine-tuning outcomes, more so than almost any other part of the ML stack.
10. Design a rigorous evaluation process comparing a fine-tuned model against its base model before deploying, including cost/latency tradeoffs of serving a fine-tuned model.
`,

  prerequisites: `
- **Required**: familiarity with what a large language model is and how it generates text (see the **LLM Fundamentals** skill — this page assumes you already know what tokens, embeddings, and next-token prediction are, and builds directly on top of that).
- **Required**: basic Python and comfort reading a training loop; you do not need to have written one from scratch, but you should be able to read one.
- **Strongly recommended**: the **Deep Learning** skill for the backpropagation and gradient-descent mechanics that fine-tuning relies on — this page will explain what happens at the level of "gradients update weights," but the actual math of computing those gradients through a transformer is covered there, not here.
- **Helpful**: the **Prompt Engineering** skill and the RAG-related skill, since a large fraction of this page is about correctly choosing between fine-tuning and those alternatives.
- **Helpful for the honest comparison section**: the **DSPy** skill, which optimizes prompts and few-shot examples against a frozen model rather than changing weights — understanding DSPy sharpens exactly what fine-tuning is and is not.

Dependency links on this platform: **LLM Fundamentals** → **Deep Learning** → this page (**Fine-Tuning**) → **Inference** → **Serving** → **Evaluation** → **Hallucination** → **Guardrails**. Fine-tuning sits squarely in the "LLMs" category alongside Prompt Engineering, Inference, Serving, Evaluation, Hallucination, and Guardrails — read this page with those siblings in mind, since a real production system usually combines several of them, not just fine-tuning alone.
`,

  "beginner-concepts": `
### What "fine-tuning" means, concretely

A pretrained language model is a huge set of numbers (weights) that were adjusted over trillions of tokens to get good at predicting the next token. Fine-tuning takes those same weights as a starting point and continues training — using gradient descent, exactly the mechanism covered in the Deep Learning skill — on a much smaller, curated dataset that represents the behavior you want. The weights move a small amount from their pretrained values toward values that make the desired behavior more likely.

~~~text
Pretraining:  random weights  --[trillions of tokens, general web text]-->  base model
Fine-tuning:  base model      --[thousands of curated examples, task-specific]-->  fine-tuned model
~~~

### The instruction/response pair — the basic unit of fine-tuning data

Most fine-tuning for LLMs today is supervised: you give the model many examples of "here is an input, here is the ideal output," and training pushes the model's own predicted output closer to the ideal one.

~~~python
# One example in a typical instruction-tuning dataset (JSONL format)
example = {
    "instruction": "Summarize the following support ticket in one sentence.",
    "input": "Customer says the app crashes every time they upload a photo larger than 10MB on iOS 17.",
    "output": "iOS app crashes on photo uploads over 10MB (iOS 17)."
}
# A full dataset is thousands of these, saved one JSON object per line (.jsonl)
~~~

### Why you do not train from scratch

Training a language model from random weights requires trillions of tokens and enormous compute — far beyond what any single team doing fine-tuning has access to or needs. Fine-tuning is cheap specifically because it reuses all of the language understanding, grammar, and world knowledge the base model already has, and only nudges a small slice of behavior. This is the same "transfer learning" idea used in computer vision for a decade before LLMs: don't relearn what edges and shapes look like, just adapt the last stretch of the model to your specific categories.

### The three ways to shape model behavior — a first look

~~~text
1. Prompting        — tell the model what to do, every single call, in the request itself.
2. RAG              — give the model the actual facts/documents it needs, at request time.
3. Fine-tuning      — change the model's weights so the desired behavior is now "built in."
~~~

Beginners should hold this simple rule from day one: fine-tuning is for teaching HOW to respond (style, format, tone, task pattern) consistently; it is not a reliable way to teach WHAT is true (new facts). The full decision framework is in Advanced Concepts, but this distinction is the single most important idea on this page and it belongs at the very start of your learning, not at the end.

### What actually changes when you fine-tune

Every weight in a neural network is a number that participates in the computation the model runs to predict the next token. Fine-tuning adjusts some or all of those numbers, using the same backpropagation and gradient descent process used in pretraining (see the **Deep Learning** skill for the mechanics), just on a different, much smaller dataset, usually for a much shorter time, and usually with a much smaller learning rate so the model does not forget everything it already knew.
`,

  "intermediate-concepts": `
### Full fine-tuning versus parameter-efficient fine-tuning (PEFT)

**Full fine-tuning** updates every parameter in the model. For a 7-billion-parameter model, that means storing and updating 7 billion weights, plus optimizer state (Adam-style optimizers typically store two extra numbers per weight for momentum and variance), plus gradients — commonly 4x or more the raw parameter memory footprint. For a 70B model this becomes hundreds of gigabytes of GPU memory, requiring multi-GPU clusters most teams do not have and, for the vast majority of fine-tuning use cases, do not need.

**Parameter-efficient fine-tuning (PEFT)** instead freezes almost all of the original weights and trains a small number of new or modified parameters — often less than 1% of the total. This is why PEFT dominates real-world practice: it gets nearly all of the behavioral benefit of full fine-tuning at a small fraction of the memory and compute, and it produces small, portable "adapter" files instead of a full copy of the model per task.

~~~text
Full fine-tuning:  update ALL weights            -> huge memory, huge storage per task
PEFT (e.g. LoRA):  freeze weights, train adapters -> tiny memory, tiny storage per task
~~~

### LoRA — Low-Rank Adaptation, mechanically

LoRA is the dominant PEFT technique. The insight: instead of updating a weight matrix W directly, freeze W entirely and learn a separate, much smaller update expressed as the product of two low-rank matrices, A and B. The effective weight used at inference is W plus (B times A), scaled by a factor. A is initialized small/random, B is initialized to zero, so at the start of training the adapter contributes nothing and the model behaves exactly like the base model — then training gradually shapes A and B.

~~~python
# Conceptual shape of a LoRA-adapted linear layer (not a runnable framework internal,
# but the actual math every LoRA implementation performs)
import torch

class LoRALinear(torch.nn.Module):
    def __init__(self, base_linear: torch.nn.Linear, rank: int = 8, alpha: int = 16):
        super().__init__()
        self.base = base_linear
        for p in self.base.parameters():
            p.requires_grad = False           # freeze the original weights

        in_f, out_f = base_linear.in_features, base_linear.out_features
        self.lora_A = torch.nn.Parameter(torch.randn(rank, in_f) * 0.01)
        self.lora_B = torch.nn.Parameter(torch.zeros(out_f, rank))  # zero init -> no-op at start
        self.scale = alpha / rank

    def forward(self, x):
        base_out = self.base(x)
        lora_out = (x @ self.lora_A.T) @ self.lora_B.T
        return base_out + self.scale * lora_out
~~~

Why low-rank updates are often sufficient: empirically, the CHANGE a model's weights need to undergo to adapt to a new narrow task tends to have a low "intrinsic rank" — the update lives in a small subspace of the full weight space, even though the original weight matrix itself is large and full-rank. You do not need to re-express the whole matrix to shift behavior meaningfully; a handful of new directions (rank 4, 8, 16, sometimes up to 64) is usually enough to capture the adaptation. This is why LoRA can reduce trainable parameters by 99% or more while recovering most of full fine-tuning's benefit for many tasks.

### QLoRA — LoRA plus quantization

QLoRA combines LoRA with quantizing the frozen base model's weights down to 4-bit precision (using techniques like NF4, a data type designed for normally-distributed neural network weights) while keeping the LoRA adapter's own computations in higher precision. The frozen base model, which is by far the largest share of memory, shrinks roughly 4x compared to 16-bit precision, while the small trainable adapter still trains effectively. This is what makes fine-tuning a 30B–70B parameter model feasible on a single high-end consumer or prosumer GPU rather than a multi-GPU server rack. See the **Inference** skill for more on quantization as a general technique, since the same core idea (represent weights with fewer bits) shows up there for serving as well as here for training.

### The SFT dataset, formatted correctly

Every base model or model family expects a specific chat/instruction template (special tokens marking user turns, assistant turns, system messages). Training data must be formatted to match this template exactly, or the model learns to associate the wrong tokens with the wrong roles.

~~~python
# Formatting one training example to a typical chat template before tokenization
def format_example(example: dict) -> str:
    return (
        "<|system|>\\nYou are a support-ticket summarizer.\\n"
        f"<|user|>\\n{example['input']}\\n"
        f"<|assistant|>\\n{example['output']}"
    )
# Mismatched or inconsistent templates between training and inference is one of the
# most common silent bugs in fine-tuning projects — the model was never shown the
# format it will actually be prompted with in production.
~~~

### Evaluating instead of assuming

A fine-tuning run "completing successfully" (loss went down) tells you almost nothing about whether the model actually improved on the behavior you care about. You must hold out a separate evaluation set — never seen during training — and score the fine-tuned model against the base model on that held-out set using the actual metric that matters for your application (exact-match for structured extraction, a rubric-scored judge for style, pass rate for a classifier). See Production Usage and Testing for the concrete workflow.
`,

  "advanced-concepts": `
### The decision framework: fine-tuning vs prompting vs RAG

This is the single most important table on this page.

| Symptom | Right lever | Why |
|---------|-------------|-----|
| Model doesn't know a specific, current, or private fact | **RAG** | Facts should be retrieved and shown to the model at inference time, not baked into weights via a few thousand training examples — weight updates do not reliably store discrete facts for accurate later recall |
| Model's answers are inconsistent in tone/format across many calls | **Fine-tuning** | Style and format are exactly the kind of statistical pattern gradient descent is good at reinforcing across thousands of examples |
| Model needs a new skill it has never seen a pattern of (e.g. a bespoke DSL, a rare output schema) | **Fine-tuning** (with enough examples) or **few-shot prompting** if examples are scarce | Fine-tuning needs volume; if you only have 20 examples, put them in the prompt instead |
| Model is capable but the prompt is long, fragile, or expensive to repeat every call | **Fine-tuning** (bake the instructions in) or **DSPy-style prompt optimization** (see the **DSPy** skill) if you want to keep weights frozen | Both reduce per-call prompt cost; fine-tuning changes weights, DSPy tunes the prompt/few-shot program against a frozen model — different levers, similar goal |
| Requirements change weekly | **Prompting or RAG** | Fine-tuning has a training-and-eval cycle measured in hours to days; a system prompt or retrieval index updates in minutes |
| You need explainability into why the model said something | **RAG** | You can show the retrieved source; a fine-tuned model's "knowledge" is opaque weights with no citation trail |

The costly mistake teams repeatedly make: fine-tuning on a company's internal knowledge base hoping the model will "know" the company's product line, and discovering months later that the model still invents plausible-sounding but wrong specifications. The fix is almost always to fine-tune (if needed at all) for how the model should format and phrase answers, while retrieving the actual facts via RAG at inference time. It is common and often correct to combine both: a model fine-tuned to reliably use retrieved context in a specific citation format, fed by a RAG pipeline for the facts themselves.

### Fine-tuning vs DSPy — the honest comparison

Fine-tuning changes the model's weights: you get a new, different model (or adapter) that behaves differently by default, with no per-call overhead for instructions once trained. The **DSPy** skill covers the alternative philosophy: keep the base model's weights entirely frozen, and instead programmatically optimize the PROMPT and the few-shot examples fed to it — treating the prompt itself as the trainable artifact, optimized against a metric using the frozen model as a black box. DSPy-style optimization is faster to iterate (no GPU training run, often minutes not hours), needs no training infrastructure, and is fully reversible by swapping the underlying model. Fine-tuning is more durable for very high call volumes (a shorter fine-tuned prompt beats a long optimized-but-still-large prompt on cost per call at scale), and it can encode behavior that few-shot examples alone cannot reliably force. Seniors treat these as complementary rather than competing: prototype behavior with DSPy-style prompt optimization first, since it is nearly free to try, and only invest in fine-tuning once you have evidence the behavior needs to be more consistent or the per-call cost needs to go down, and you have enough quality data to justify a training run.

### Catastrophic forgetting

Because fine-tuning nudges weights toward the new dataset's distribution, the model can lose general capability it isn't being reinforced to retain — a classic case is a model fine-tuned heavily on customer-support tone that becomes noticeably worse at general reasoning, coding, or following instructions unrelated to support. Mitigations:

1. **Use PEFT (LoRA/QLoRA) instead of full fine-tuning** — because the base weights stay frozen, the model's general capability is architecturally preserved; only the small adapter's contribution is new, and it can even be disabled by removing the adapter.
2. **Mix in general instruction data** alongside your task-specific data, so training doesn't only ever reinforce the narrow distribution.
3. **Use a low learning rate and few epochs** — over-training on a small dataset is the most common direct cause of forgetting; watch validation loss on a held-out general-capability set, not just your task loss.
4. **Regularize toward the base model** — some setups penalize the fine-tuned model's output distribution for diverging too far from the base model's on general prompts (a similar spirit to what KL-penalties do in RLHF/DPO, described below).
5. **Evaluate general capability, not just task capability, before shipping** — see Testing and the Evaluation skill.

### RLHF and DPO — conceptual level, honestly hedged

**RLHF (Reinforcement Learning from Human Feedback)** is a multi-stage process: collect human preference judgments between pairs of model outputs, train a reward model to predict those preferences, then use reinforcement learning (commonly PPO) to adjust the language model's weights to produce outputs the reward model scores highly, while a KL-divergence penalty keeps the model from drifting too far from its starting point (which itself helps prevent the catastrophic forgetting described above). This is conceptually a way of teaching a model to prefer the kind of output humans prefer, beyond what supervised examples alone specify.

**DPO (Direct Preference Optimization)** reframes the same goal — train a model to prefer human-preferred outputs — as a single supervised-style loss directly on preference pairs (chosen output vs rejected output), without needing a separate reward model or an RL training loop. It is simpler to implement and more stable to train than full RLHF/PPO pipelines.

Honest hedge: the field has moved quickly here, and multiple variants and successors (and disagreements about which is "best" for which situation) exist. Treat the statement "DPO is simpler than RLHF" as a stable, foundational claim, but do not assume any one specific named technique is THE current industry standard without checking current sources — this is exactly the kind of fast-moving detail worth verifying against the model providers' current documentation and recent papers before making a technique choice for a real project. See Latest Updates.

### Choosing rank, alpha, and target modules in LoRA

Practical senior-level defaults: start with rank 8 or 16 for most instruction-style fine-tuning tasks, targeting the attention projection matrices (query and value projections at minimum; query, key, value, and output for stronger adaptation). Increase rank if the task requires learning a genuinely large behavioral shift (a very different output structure or domain); higher rank costs more memory and risks overfitting on small datasets. Alpha is a scaling factor typically set to 2x the rank as a starting heuristic, then tuned. These are starting points to validate empirically against your own held-out evaluation set, not universal constants.
`,

  "internal-working": `
Fine-tuning with LoRA, end to end, works like this:

~~~mermaid
flowchart TB
    A["Pretrained base model weights (frozen)"] --> B["Insert LoRA adapters\\n(small matrices A, B) at target layers"]
    B --> C["Forward pass: base output + scaled low-rank update"]
    C --> D["Compute loss against target token in training example"]
    D --> E["Backpropagation (see Deep Learning skill)\\ngradients computed ONLY for A and B"]
    E --> F["Optimizer step updates A and B\\n(base weights untouched)"]
    F --> C
    F --> G["After training: merge or keep adapter separate"]
    G --> H["Serve: base weights + adapter\\n= fine-tuned behavior"]
~~~

Step by step:

1. **Load the frozen base model** in the desired precision (often 4-bit for QLoRA, 16-bit for plain LoRA). Its weights never receive gradients.
2. **Attach LoRA adapters** to specific linear layers (typically the attention projections). Each adapter is a pair of small matrices, initialized so the adapter contributes nothing at the very start of training.
3. **Forward pass**: for every training example, run the input through the model; at each adapted layer, the output is the frozen layer's normal output plus the LoRA path's contribution.
4. **Loss computation**: compare the model's predicted next-token probabilities against the actual target tokens in the training example (standard cross-entropy loss, the same objective used in pretraining, just on your curated dataset).
5. **Backpropagation**: gradients flow backward through the whole network (required to reach the adapters, which sit inside early and middle layers too), but only the adapter parameters (A and B) actually accumulate gradients that get used to update weights, since the base weights have gradients disabled.
6. **Optimizer step**: an optimizer (commonly AdamW) updates only the adapter parameters using those gradients and a learning rate schedule (often with warmup and decay).
7. **Repeat over the dataset** for a small number of epochs (often 1–3 for instruction fine-tuning — more risks overfitting a small dataset and inducing forgetting).
8. **After training**, the adapter can either be kept as a small separate file loaded alongside the base model at inference time, or mathematically merged into the base weights to produce a single standalone model with no runtime overhead.

This is the mechanical reason LoRA is so much cheaper than full fine-tuning: the optimizer only needs memory for the tiny adapter parameters and their gradients and optimizer states, not for the billions of frozen base parameters, even though the forward and backward pass still touch the whole network.
`,

  architecture: `
Two architectures matter here: the **training-time architecture** (how a fine-tuning run is structured) and the **application architecture** (how a fine-tuned model fits into a real system).

### Training-time architecture

~~~mermaid
flowchart LR
    subgraph Data["Data pipeline"]
        Raw["Raw examples\\n(support tickets, docs, logs)"]
        Curate["Curation + dedup + quality filtering"]
        Format["Template formatting\\n(chat template, roles)"]
        Split["Train / validation / held-out test split"]
    end
    subgraph Train["Training job"]
        Base["Frozen base model (4-bit or 16-bit)"]
        Adapter["LoRA/QLoRA adapters"]
        Loop["Training loop (forward, loss, backward, optimizer step)"]
    end
    subgraph Eval["Evaluation"]
        HeldOut["Held-out test set scoring"]
        BaseCompare["Compare vs base model + vs prompted alternative"]
    end
    Raw --> Curate --> Format --> Split --> Loop
    Base --> Loop
    Adapter --> Loop
    Loop --> HeldOut --> BaseCompare --> Decision["Ship adapter / merge / reject"]
~~~

### Application architecture around a fine-tuned model

A production system almost never deploys "just the fine-tuned model." A typical layout:

~~~text
service/
├── router/            # decides which model/adapter handles a request
├── prompts/            # system prompts, kept even for fine-tuned models
├── retrieval/          # RAG layer for facts, separate from fine-tuned style/format model
├── adapters/           # versioned LoRA adapter checkpoints, one per task/customer
├── serving/            # inference server (see the Serving and Inference skills)
├── eval/               # held-out eval sets + scoring harness, run on every new checkpoint
└── guardrails/          # output validation, safety filters (see the Guardrails skill)
~~~

Key architectural principle: fine-tuning is one component in a pipeline, not a replacement for the pipeline. A fine-tuned model for format/style is frequently paired with a RAG layer for facts and a guardrails layer for output validation — the three concerns are separate because they solve separate problems (see Problem It Solves).
`,

  "data-flow": `
Tracing one training example through a LoRA fine-tuning loop, end to end:

~~~mermaid
sequenceDiagram
    participant DS as Dataset (JSONL)
    participant Tok as Tokenizer
    participant Model as Base model + LoRA adapters
    participant Loss as Loss function
    participant Opt as Optimizer

    DS->>Tok: raw example (instruction, input, output)
    Tok->>Tok: apply chat template, tokenize to input_ids
    Tok->>Model: batch of token ids
    Model->>Model: forward pass through frozen layers + LoRA paths
    Model->>Loss: predicted next-token logits
    Loss->>Loss: cross-entropy vs actual target tokens
    Loss->>Model: backpropagate gradients
    Note over Model: gradients computed for ALL layers,\\nbut only LoRA A/B parameters have requires_grad = True
    Model->>Opt: gradients for adapter parameters only
    Opt->>Model: update adapter weights (base weights untouched)
    Model-->>DS: next batch
~~~

The step worth dwelling on: tokenization and templating happen BEFORE the model ever sees the example, and any mismatch here (wrong role tokens, wrong end-of-turn marker, truncated context) silently corrupts the entire training run without necessarily crashing it — the loss will still go down, just toward the wrong target. This is why format validation on a handful of examples, by hand, before a full training run, is a non-negotiable step (see Testing and Common Mistakes).

At inference time after fine-tuning, the data flow is: user request → same chat template applied → tokenized → forward pass through frozen base weights plus the now-trained adapter → output tokens → detokenized response. The adapter's contribution is now non-zero and shaped by training, which is the entire point.
`,

  "production-usage": `
### Choosing a fine-tuning path

Real teams pick between three tiers, roughly in order of increasing control and decreasing convenience:

1. **Hosted fine-tuning APIs** (e.g. a model provider's fine-tuning endpoint): upload a JSONL dataset, call an API, get back a fine-tuned model identifier to call like any other model. Lowest effort, no GPU management, but you don't control the underlying technique (usually LoRA-like under the hood, undisclosed in detail) and you're locked into that provider's serving.
2. **Managed PEFT platforms** (fine-tuning-as-a-service providers, or notebooks on a rented GPU): more control over hyperparameters, rank, target modules, and data mixing, still without owning infrastructure.
3. **Self-managed PEFT with open-weight models**: using Hugging Face's transformers plus PEFT (or higher-level wrappers like Axolotl or Unsloth) on owned or rented GPUs — full control, most effort, needed when data cannot leave your infrastructure or the model must be self-hosted.

### The end-to-end SFT project layout

~~~text
finetune-project/
├── data/
│   ├── raw/                # source examples before cleaning
│   ├── curated.jsonl       # deduplicated, quality-filtered, template-formatted
│   ├── train.jsonl
│   ├── val.jsonl
│   └── held_out_test.jsonl # NEVER touched until final evaluation
├── configs/
│   └── lora_config.yaml    # rank, alpha, target_modules, learning_rate, epochs
├── train.py
├── eval/
│   ├── metrics.py          # task-specific scoring (exact match, judge rubric, etc.)
│   └── compare_to_base.py  # side-by-side base vs fine-tuned scoring
└── adapters/
    └── v1/, v2/, ...        # versioned checkpoints, never overwritten in place
~~~

### Operational defaults teams actually use

- Start with a small learning rate (commonly in the 1e-4 to 2e-4 range for LoRA adapters, notably higher than full fine-tuning's 1e-5-ish range because only a small number of parameters are moving) and 1–3 epochs; watch validation loss for the point it stops improving or starts diverging from the general-capability check.
- Keep a fixed, frozen held-out test set from the very first day of the project — never let it leak into training data curation, even accidentally.
- Version every adapter checkpoint with the exact dataset version, config, and evaluation scores it produced — treat this exactly like model/code version control (see Production Checklist).
- Run the SAME evaluation harness against the base model, the fine-tuned model, and (where relevant) a well-prompted version of the base model, every time — this three-way comparison is what actually justifies (or kills) a fine-tuning project.
`,

  "industry-examples": `
- **OpenAI**: offers a hosted fine-tuning API (historically for GPT-3.5-class and select GPT-4-class models) explicitly marketed for consistent formatting, tone, and following a specific structure more reliably than prompting — and its own documentation has repeatedly cautioned that fine-tuning is not the tool for adding new factual knowledge, recommending retrieval for that instead.
- **Hugging Face**: built and maintains the PEFT library (LoRA, QLoRA, and related techniques) that has become the de facto open-source standard for parameter-efficient fine-tuning, used across the open-weight model ecosystem.
- **Anthropic**: has offered fine-tuning capabilities for enterprise customers on Claude models for narrow, high-volume tasks where consistent formatting and behavior at lower cost matters, while continuing to position RAG and prompting as the primary levers for knowledge-grounded tasks — consistent with the framework in this page. Exact current program details should be checked against Anthropic's current documentation, since enterprise offerings change.
- **Together AI / Fireworks AI / Replicate**: GPU cloud and inference providers that offer managed fine-tuning (often LoRA/QLoRA-based) on open-weight models as a product, targeting teams that want the self-managed PEFT tier of control without owning GPU infrastructure.
- **Enterprise support and legal-tech companies** (commonly cited in industry case studies, though specific vendor claims should be verified) fine-tune smaller open-weight models on narrow domains — ticket classification, structured clause extraction — specifically to get small, cheap, fast, consistent models rather than calling a large general model on every request.

Pattern to notice: the companies with the most fine-tuning experience are also the most vocal about its limits — nearly every major provider's own documentation repeats some version of "use fine-tuning for behavior, use retrieval for knowledge," which is a strong signal this isn't just a platform opinion, it's the field's converged best practice.
`,

  "best-practices": `
1. **Default to prompting or RAG first.** Only reach for fine-tuning once you have concrete evidence (failed prompt iterations, measured inconsistency, real cost/latency pressure at volume) that those cheaper levers are insufficient.
2. **Never fine-tune to inject facts.** If the goal is "the model should know X," build a RAG pipeline; fine-tune only the surrounding behavior (how it should cite, format, or phrase answers).
3. **Start with PEFT (LoRA/QLoRA), not full fine-tuning**, unless you have a specific, evidenced reason full fine-tuning is required — it almost never is for adapting an already-capable base model.
4. **Invest disproportionately in dataset quality over dataset size.** A few hundred carefully curated, correct, diverse examples reliably beat tens of thousands of noisy scraped ones.
5. **Hold out a test set from day one and never let it leak** into curation, deduplication, or manual review passes used to build the training set.
6. **Always evaluate against the base model and a well-prompted baseline**, not in isolation — a fine-tuned model that merely matches a well-prompted base model did not justify the training run.
7. **Match the exact chat template** the base model was originally trained with; mismatched special tokens between fine-tuning and inference is one of the most common and hardest-to-notice bugs.
8. **Use a small learning rate and few epochs**, and monitor a general-capability check alongside task loss to catch catastrophic forgetting early.
9. **Version every checkpoint** with its exact dataset version, hyperparameters, and evaluation scores — treat adapters as artifacts under the same discipline as code and model weights.
10. **Keep the base model frozen and prefer adapters over merged weights during iteration** — you can swap, disable, or A/B test adapters without re-deploying a whole new model.
11. **Budget for ongoing re-evaluation**, not a one-time train-and-forget — as the base model provider updates the underlying model, or as production data drifts, a previously-good fine-tune can silently degrade in relative quality.
12. **Combine levers deliberately**: a model fine-tuned for format/tone, fed by a RAG layer for facts, wrapped by a guardrails layer for safety, is a common and often correct production architecture — not redundancy.
`,

  "anti-patterns": `
### Fine-tuning to teach facts (the classic, expensive mistake)

~~~text
WRONG: "Let's fine-tune the model on our entire internal wiki so it knows our
        product specs, pricing, and policies."
Result: A model that is stylistically fluent in your domain's jargon, but
        still confidently invents specific numbers, dates, and policy details
        that were never reliably memorized — often WORSE than the base model
        because it now sounds more authoritative while being just as wrong.

RIGHT: Build a RAG pipeline that retrieves the actual wiki page at query time
       and feeds it to the model as context. Fine-tune (if at all) only how
       the model should phrase, cite, and format answers using that context.
~~~

### Fine-tuning before exhausting prompting

~~~text
WRONG: Jump straight to a multi-day fine-tuning project because a first-draft
        prompt didn't produce consistent enough output.

RIGHT: Iterate on the prompt (few-shot examples, explicit format instructions,
       structured output constraints) and measure against a real eval set
       first. Only fine-tune once you have evidence — a measured accuracy or
       consistency gap that prompting genuinely cannot close, or a real
       cost/latency requirement at volume — that justifies the investment.
~~~

### Other production-grade anti-patterns

- **Training on the evaluation set** (even by accident, through careless data curation or deduplication that mixes splits) — invalidates every result the project produces.
- **Ignoring the chat template** — training on raw concatenated text instead of the model's expected role-tagged format teaches the model an inconsistent format it won't reliably use at inference.
- **Overfitting a tiny dataset with too many epochs** — loss keeps dropping on the training set while the model quietly loses general capability and starts producing verbatim memorized training examples instead of generalized behavior.
- **Shipping without comparing to the base model** — a fine-tuning project that never rigorously asks "is this actually better than just prompting the base model well?" cannot justify its own existence, and often isn't.
- **Treating one successful metric as sufficient** — optimizing only for, say, format compliance while never checking whether general quality or safety regressed is how catastrophic forgetting ships to production unnoticed.
- **Full fine-tuning by default** — reaching for full-parameter updates when LoRA/QLoRA would have achieved comparable results at a fraction of the cost and risk.
`,

  performance: `
### Measure before optimizing anything

~~~bash
# Track GPU memory and utilization during a training run
nvidia-smi -l 1
# Hugging Face's Trainer and most PEFT training scripts log loss curves and
# throughput (tokens/sec) automatically — watch these before touching config
~~~

### The performance-and-cost hierarchy for fine-tuning itself (apply in order)

1. **Use PEFT (LoRA), not full fine-tuning** — the single largest lever; typically reduces trainable parameters by over 99% and memory footprint dramatically, with little to no quality loss for most adaptation tasks.
2. **Add quantization (QLoRA)** if memory is still the constraint — 4-bit base weights cut memory roughly 4x versus 16-bit, at a modest, usually acceptable quality cost.
3. **Right-size the rank** — don't default to the largest rank available; a rank that is too high increases memory and overfitting risk without improving results if the task's true "intrinsic rank" is small.
4. **Use gradient checkpointing** for large models on limited memory — trades some compute time for a large memory reduction by recomputing activations during the backward pass instead of storing them all.
5. **Batch size and gradient accumulation** — larger effective batch sizes (via accumulation, since real batch size is often memory-limited) generally give more stable training, at the cost of more steps/time per epoch.
6. **Mixed precision** (bf16/fp16 compute even when weights are quantized) speeds up the arithmetic on modern GPUs substantially over full fp32.

### Performance considerations once deployed

A fine-tuned model's inference performance is governed by the same factors as any model of its size (see the **Inference** and **Serving** skills) — the fine-tuning step itself does not change inference latency for a merged model, though serving with a separate LoRA adapter loaded at runtime adds a small, usually negligible overhead compared to a fully merged checkpoint. The main performance WIN from fine-tuning is usually indirect: a smaller fine-tuned model replacing a much larger prompted model for the same task is faster and cheaper per call, not because fine-tuning made inference faster, but because it let you use a smaller model at all.
`,

  scalability: `
Fine-tuning scalability has two distinct axes: scaling the TRAINING process, and scaling SERVING many fine-tuned variants.

### Scaling training

~~~mermaid
flowchart LR
    Single["Single GPU\\n(QLoRA, small-to-mid models)"] --> Multi["Multi-GPU, single node\\n(data parallel, larger models)"]
    Multi --> Cluster["Multi-node cluster\\n(full fine-tuning of very large models — rarely needed for PEFT)"]
~~~

For the vast majority of PEFT fine-tuning jobs, a single modern GPU (or a single node with a handful of GPUs) is sufficient, because the trainable parameter count is tiny even if the frozen base model is large. Full fine-tuning of large models is the case that actually forces multi-node, sharded training (frameworks like DeepSpeed or FSDP) — another reason PEFT dominates practice: most teams simply never need to solve that harder scaling problem.

### Scaling serving many fine-tuned adapters

The more common production scaling question is: "we have 50 customers, each with their own fine-tuned adapter — how do we serve all of them without 50x the GPU memory?" The answer is adapter multiplexing: keep ONE copy of the frozen base model loaded, and swap or batch-serve many small LoRA adapters against it, since adapters are tiny (megabytes, not gigabytes) compared to the base model (gigabytes to hundreds of gigabytes). Purpose-built serving frameworks (see the **Serving** skill) support serving many LoRA adapters concurrently against a shared base model, batching requests across different adapters efficiently.

| Bottleneck | Answer |
|------------|--------|
| GPU memory during training | QLoRA (quantized base) + gradient checkpointing |
| Many fine-tuned variants to serve | Adapter multiplexing over one shared frozen base model |
| Training data volume growth | Streaming/sharded data loading instead of loading the full dataset into memory |
| Re-training cadence as production data drifts | Automate the eval-compare-decide loop (Production Usage) so re-fine-tuning is a repeatable pipeline, not a manual project each time |
`,

  security: `
### Fine-tuning-specific attack surface

1. **Training data poisoning.** If any part of your fine-tuning dataset is sourced from untrusted or user-contributed content, an attacker can inject examples designed to teach the model harmful, biased, or backdoored behavior (e.g., a trigger phrase that causes the model to leak data or bypass a safety instruction). Treat fine-tuning data curation with the same rigor as a supply-chain security problem — review, provenance-track, and filter sources.
2. **Sensitive data memorization.** Small fine-tuning datasets, trained for multiple epochs, are more prone to verbatim memorization than pretraining on trillions of diverse tokens. If your dataset contains personal data, secrets, or confidential business information, the fine-tuned model can regurgitate it verbatim to a sufficiently clever prompt. Scrub PII and secrets from training data before training, not after.
3. **Adapter provenance.** If you load third-party LoRA adapters (from a model hub or a vendor), you are trusting that adapter's training process the same way you would trust a dependency — an adapter can encode a backdoor or bias just as effectively as a base model can. Vet adapter sources the way you would vet any third-party model artifact.
4. **Fine-tuning does not add safety.** A fine-tuned model still needs the same guardrails (input validation, output filtering, abuse monitoring) as any other model in production — fine-tuning for a narrow task does not imply the model has been safety-aligned for that task's edge cases. See the **Guardrails** skill.

### Mitigations

- Maintain a documented data provenance trail for every training example, especially anything sourced externally.
- Run a PII/secret scanner over the curated dataset before training, not just over raw source data.
- Include held-out red-team-style prompts in evaluation to probe whether the fine-tuned model leaks memorized sensitive examples or has picked up unintended biases from the data.
- Treat every fine-tuned checkpoint and every third-party adapter as a supply-chain artifact requiring the same review discipline as a new dependency (see the general **Security** and **Guardrails** skills for depth beyond what's fine-tuning-specific here).
`,

  testing: `
### The core testing discipline for fine-tuning: three-way comparison

Every fine-tuning project's test suite should score, on the SAME held-out set, at minimum: the base model with no special prompting, the base model with a well-engineered prompt, and the fine-tuned model. Shipping is only justified if the fine-tuned model measurably beats the well-prompted baseline on the metric that matters, since a well-prompted base model is the true "free" alternative.

~~~python
# Conceptual evaluation harness structure (task-specific metric plugged in)
def evaluate(model, test_set: list[dict], metric_fn) -> float:
    scores = []
    for example in test_set:
        prediction = model.generate(example["input"])
        scores.append(metric_fn(prediction, example["expected_output"]))
    return sum(scores) / len(scores)

base_score = evaluate(base_model, held_out_test, exact_match_metric)
prompted_score = evaluate(base_model_with_prompt, held_out_test, exact_match_metric)
finetuned_score = evaluate(finetuned_model, held_out_test, exact_match_metric)

assert finetuned_score > prompted_score, (
    "Fine-tuning did not beat a well-prompted baseline — "
    "do not ship; investigate data quality or reconsider the approach."
)
~~~

### General-capability regression testing

Alongside the task-specific metric, run a small, fixed suite of general-capability prompts (reasoning, instruction-following, safety refusals unrelated to the fine-tuning task) through both the base and fine-tuned model, and flag any material regression — this is your catastrophic-forgetting canary.

### Data-level testing, before training even starts

- **Format validation**: render 10–20 examples through the exact chat template used for training and manually read them — catches template mismatches before wasting a training run.
- **Deduplication and leakage checks**: verify no held-out test example appears (even paraphrased) in the training set.
- **Label/output sanity checks**: for classification or extraction tasks, verify a sample of labels against ground truth by hand; a single systematic labeling error propagated across thousands of examples will be learned as confidently as a correct one.

See the **Evaluation** skill for the broader discipline of building rigorous LLM evaluation harnesses beyond fine-tuning specifically.
`,

  debugging: `
### Escalation path when a fine-tuning run isn't producing the expected behavior

1. **Check the formatted training examples by hand first.** Print 5–10 fully-templated examples exactly as the model will see them (with special tokens visible) before assuming the model or hyperparameters are at fault — a template mismatch is the most common root cause of "the fine-tune didn't work."
2. **Look at the loss curve, not just the final number.** A loss that plateaus immediately suggests the learning rate is too low or the adapter isn't attached to the layers that matter for this task; a loss that drops to near-zero suspiciously fast suggests overfitting or a leaked/duplicated dataset.
3. **Generate on training examples themselves.** If the fine-tuned model cannot even reproduce behavior close to its own training examples, something upstream (templating, tokenization, target masking) is broken — the model should at minimum overfit slightly on data it trained on.
4. **Check target masking.** In most SFT setups, the loss should only be computed on the assistant's response tokens, not the instruction/input tokens — a bug that includes the prompt tokens in the loss teaches the model to also "predict the question," diluting the useful signal.

~~~python
# Sanity check: only response tokens should have non-masked labels
def build_labels(input_ids, response_start_idx):
    labels = input_ids.copy()
    labels[:response_start_idx] = [-100] * response_start_idx  # -100 = ignored by loss
    return labels
~~~

5. **Compare adapter-attached-and-loaded behavior to the merged-checkpoint behavior.** A mismatch here indicates a bug in how the adapter is being applied at inference (wrong scale factor, wrong target modules) rather than in the training itself.
6. **When in doubt, retrain on a tiny 10-example subset and confirm the model visibly changes behavior on those 10 examples** — the fastest possible signal that the training loop is wired correctly before spending a full run's compute budget.
`,

  monitoring: `
### What to track during training

~~~python
# Typical fields logged every N steps during a fine-tuning run
log_entry = {
    "step": step,
    "train_loss": loss.item(),
    "learning_rate": scheduler.get_last_lr()[0],
    "grad_norm": grad_norm,             # spikes often signal instability
    "tokens_per_second": throughput,
    "gpu_memory_gb": torch.cuda.max_memory_allocated() / 1e9,
}
~~~

Watch for: training loss decreasing while a held-out validation loss stalls or rises (overfitting), gradient norm spikes (learning rate too high or a bad batch), and GPU memory creeping toward the limit over the course of training (a leak, not expected behavior for a stable loop).

### What to track after deployment

- **Task metric drift over time** — re-run the held-out eval periodically against live traffic samples; a fine-tuned model's relative advantage over the base model can erode as production data distribution shifts away from what the training set represented.
- **Output format compliance rate in production** — if the model was fine-tuned for structured output, track the real-world parse/validation success rate as a live metric, not just the one-time eval score.
- **Cost and latency versus the alternative** — continuously verify the fine-tuned model is still cheaper/faster than the well-prompted baseline it was meant to replace; provider pricing and model capability both change over time.
- **Adapter version in every log line** — tag production requests with which adapter checkpoint served them, so a regression can be traced to a specific training run (see Deployment and Production Checklist).

See the **Serving** and **Evaluation** skills for the broader monitoring stack a fine-tuned model sits inside.
`,

  deployment: `
### Two deployment shapes

**Merged deployment**: the LoRA adapter is mathematically folded into the base weights, producing one standalone checkpoint with no runtime adapter overhead. Simpler to serve, but you lose the ability to swap adapters without redeploying, and you now store a full model copy per fine-tuned variant.

**Adapter-attached deployment**: the frozen base model is loaded once, and one or more LoRA adapters are attached at inference time. More flexible (multiple task-specific adapters share one base model in memory), and better suited when you serve many narrow fine-tunes (per-customer or per-task) against the same underlying model — see Scalability.

~~~python
# Conceptual example using Hugging Face transformers + PEFT
from transformers import AutoModelForCausalLM, AutoTokenizer
from peft import PeftModel

base = AutoModelForCausalLM.from_pretrained("base-model-name", load_in_4bit=True)
tokenizer = AutoTokenizer.from_pretrained("base-model-name")

# Attach a specific trained adapter for serving
model = PeftModel.from_pretrained(base, "adapters/support-ticket-summarizer/v3")

# Optional: merge for a standalone deployable checkpoint with no adapter overhead
merged = model.merge_and_unload()
merged.save_pretrained("checkpoints/support-ticket-summarizer-v3-merged")
~~~

### Deployment checklist for the checkpoint itself

- Tag the deployed checkpoint with the exact dataset version, config, and evaluation scores that justified shipping it (see Production Checklist).
- Roll out behind a canary or shadow-traffic stage before full cutover — compare live outputs against the previous model/adapter on a sample of real traffic, not just the offline eval set.
- Keep the previous adapter/checkpoint immediately available for rollback; treat a fine-tuned model exactly like any other deployable artifact requiring a rollback path (see the **Serving** and **Deployment**-adjacent skills for the general infrastructure pattern).
- Serve behind the same guardrails and monitoring stack as any other model in the fleet — fine-tuning does not exempt a model from standard production controls.
`,

  "production-checklist": `
Before a fine-tuned model or adapter takes real production traffic:

- [ ] Confirmed the problem is genuinely a fine-tuning problem (style/format/domain-behavior), not a knowledge-injection problem better solved by RAG
- [ ] Prompting-only baseline was tried and measured, and the fine-tuned model beats it on the actual eval metric
- [ ] Training data has documented provenance; no untrusted or unreviewed sources included
- [ ] Training data scrubbed of PII and secrets
- [ ] Held-out test set was created before training and never touched during curation or training
- [ ] Chat/instruction template verified by hand on real formatted examples before the full training run
- [ ] Loss masking verified — loss computed only on response tokens, not instruction/input tokens
- [ ] PEFT (LoRA/QLoRA) used unless full fine-tuning was specifically justified
- [ ] General-capability regression suite run alongside task metric to catch catastrophic forgetting
- [ ] Checkpoint versioned with exact dataset version, hyperparameters, and evaluation scores
- [ ] Three-way comparison completed and documented: base model, well-prompted base model, fine-tuned model
- [ ] Canary/shadow-traffic rollout plan in place with a rollback path to the previous model/adapter
- [ ] Serving path decided (merged vs adapter-attached) with memory/latency implications understood
- [ ] Guardrails and monitoring stack wired identically to how other production models are handled
- [ ] Re-evaluation cadence scheduled — not a one-time train-and-forget project
`,

  "common-mistakes": `
1. **Fine-tuning to inject facts** — the single most expensive and common mistake; see Problem It Solves and Anti-Patterns. WHY it happens: "fine-tuning" sounds like "teaching the model things," and teams intuitively reach for it before understanding that gradient descent on a few thousand examples does not reliably store discrete facts.
2. **Skipping the prompting/RAG baseline** — teams start a fine-tuning project without first measuring how far prompting alone gets them, making it impossible to know later whether the fine-tune was actually worth the cost.
3. **Too little, too noisy data** — a few hundred inconsistent or mislabeled examples teach the model an inconsistent pattern; quality and consistency matter more than raw count.
4. **Chat template mismatch** — training on a differently-formatted prompt than production will actually send, silently degrading real-world performance despite a good offline eval score.
5. **No held-out test set, or a leaked one** — makes every subsequent claim about the fine-tune's quality unverifiable.
6. **Overfitting via too many epochs on a small dataset** — loss keeps improving on paper while general capability and true generalization degrade.
7. **Never comparing against the base model** — shipping a fine-tune that never demonstrably beat a well-prompted base model.
8. **Treating adapters as disposable rather than versioned artifacts** — losing the ability to reproduce or roll back a specific fine-tuning result.
9. **Ignoring catastrophic forgetting until a user notices** — no general-capability regression check in the evaluation loop.
10. **Assuming a fine-tuned small model has the reasoning capacity of a larger model** — fine-tuning shapes behavior within a model's existing capacity; it does not add capacity the base model never had.
`,

  "common-errors": `
| Error / symptom | Typical cause | Fix |
|------------------|----------------|-----|
| Loss decreases but generated output looks unrelated to training examples | Chat template mismatch between training and generation | Render and compare formatted training examples against actual inference prompts, token for token |
| Model reproduces training examples verbatim on unrelated prompts | Overfitting from too many epochs on too small a dataset | Reduce epochs, increase data diversity, add regularization / early stopping on validation loss |
| Fine-tuned model worse at general tasks it wasn't trained on | Catastrophic forgetting | Use PEFT instead of full fine-tuning, mix in general instruction data, reduce learning rate/epochs |
| Loss barely moves from the start | Learning rate too low, or adapter not attached to layers that matter for the task | Increase learning rate within a safe range; verify target_modules includes the right projections |
| Out-of-memory during training | Full fine-tuning, or rank/batch size too large for available GPU memory | Switch to QLoRA, enable gradient checkpointing, reduce batch size with gradient accumulation |
| Model "knows" facts during training data review but confabulates them at inference | Facts were memorized inconsistently rather than reliably encoded — expected behavior of weight-based knowledge storage | Move factual grounding to a RAG pipeline instead of relying on fine-tuning |
| Adapter loads but produces identical output to the base model | Adapter scale/alpha misconfigured, or wrong adapter path loaded | Verify PeftModel.from_pretrained points at the trained checkpoint; check alpha/rank match training config |
| Great offline eval score, complaints in production | Held-out test set doesn't represent real traffic distribution | Refresh the eval set from real production samples periodically; add shadow-traffic comparison before full rollout |

The recurring lesson: most fine-tuning errors are data and formatting bugs, not exotic training bugs — always suspect the data pipeline before the training loop.
`,

  faqs: `
**Q: Is fine-tuning always better than a good prompt?**
No, frequently the opposite. A well-engineered prompt (with few-shot examples, explicit formatting instructions) on a strong base model matches or beats a hastily fine-tuned model in a large share of real cases, at a fraction of the effort. Fine-tuning earns its cost when you have measured evidence — inconsistency prompting can't fix, or real cost/latency pressure at high volume.

**Q: Can I use fine-tuning to teach the model about our company's private documents?**
Not reliably, if the goal is factual recall. Use RAG to retrieve the actual documents at query time. Fine-tuning can teach the model how to phrase, cite, or format answers that use retrieved context, but it should not be your mechanism for the facts themselves.

**Q: How much data do I actually need?**
It depends heavily on task complexity, but a common range for a narrow style/format/behavior fine-tune is a few hundred to a few thousand high-quality examples — far less than most people assume, and far less valuable to scale up than to clean up. A thousand carefully reviewed examples reliably beats fifty thousand scraped ones.

**Q: LoRA or QLoRA — which should I use?**
Use QLoRA when GPU memory is the binding constraint (larger base models, smaller/cheaper hardware); use plain LoRA (base model in 16-bit) when you have enough memory headroom and want to avoid the small quality tradeoff quantization can introduce. Both are far cheaper than full fine-tuning; the choice between them is a memory-versus-precision tradeoff, not a philosophical one.

**Q: Should I use RLHF or DPO?**
Both are conceptually about training a model to prefer human-preferred outputs; DPO is simpler to implement and more commonly reached for by teams without dedicated RL infrastructure, since it avoids a separate reward model and RL training loop. This is a fast-moving area — verify current best practice against recent papers and provider documentation rather than treating any single technique as permanently "the standard" (see Latest Updates).

**Q: Will fine-tuning make my model "safer" or more aligned automatically?**
No. Fine-tuning for a narrow task does not imply safety alignment for that task's edge cases; the model still needs the same guardrails, monitoring, and red-teaming as any deployed model (see the **Guardrails** skill).

**Q: How is fine-tuning different from DSPy-style prompt optimization?**
Fine-tuning changes the model's weights; DSPy (see the **DSPy** skill) keeps the model completely frozen and instead optimizes the prompt and few-shot examples fed to it, treating the prompt as the trainable artifact. They are different levers for a similar goal — DSPy-style optimization is cheaper and faster to iterate on, fine-tuning is more durable and can reduce per-call cost at very high volume.

**Q: Do I need a GPU cluster to fine-tune?**
For PEFT (LoRA/QLoRA) on most model sizes teams actually adapt, no — a single modern GPU is frequently sufficient, which is a large part of why PEFT dominates practice over full fine-tuning.
`,

  "interview-questions": `
**Junior/Mid:**

1. *What is fine-tuning, in one sentence?* Continuing training of a pretrained model on a smaller, task-specific dataset so it internalizes a desired style, format, or behavior more reliably than prompting alone.
2. *What is the difference between full fine-tuning and PEFT?* Full fine-tuning updates every parameter; PEFT (e.g. LoRA) freezes the base model and trains a small number of additional parameters, drastically reducing memory and compute while capturing most of the benefit for typical adaptation tasks.
3. *What is LoRA, mechanically?* Freeze the original weight matrix, learn a low-rank update expressed as the product of two small matrices added to the frozen weight's output, scaled by a factor — trainable parameter count drops by orders of magnitude.
4. *When should you use fine-tuning instead of prompting?* When you have measured evidence that prompting cannot achieve the needed consistency, or when per-call cost/latency at high volume justifies baking behavior into weights instead of repeating instructions every call.
5. *Can fine-tuning teach a model new facts reliably?* No — fine-tuning is better suited to teaching style, format, and behavior patterns; reliable factual grounding, especially for current or private information, should come from RAG.

**Senior:**

6. *Why does low-rank adaptation work — why don't you need to update the full weight matrix?* The change a model's weights need to undergo to adapt to a narrow new task empirically tends to have low "intrinsic rank" — the useful update lives in a small subspace, so a small number of new directions captures most of the adaptation, even though the original matrix is large and full-rank.
7. *Explain QLoRA and why it matters.* LoRA combined with quantizing the frozen base model's weights to 4-bit precision (e.g. the NF4 data type), cutting the dominant memory cost (the frozen base) roughly 4x versus 16-bit, while the small trainable adapter still trains effectively — this is what makes fine-tuning tens-of-billions-of-parameter models feasible on a single GPU.
8. *What is catastrophic forgetting and how do you mitigate it?* The model loses general capability while gaining the specific fine-tuned behavior, from over-training on a narrow distribution; mitigate with PEFT (frozen base preserves general capability architecturally), low learning rates, few epochs, mixed-in general data, and explicit general-capability regression testing.
9. *Walk me through how you'd decide whether a real production problem needs fine-tuning, RAG, or better prompting.* Diagnose the failure mode first: is the model wrong on facts (RAG), inconsistent in style/format (fine-tuning), or just under-specified in what's being asked (prompting)? Measure a prompting-only baseline before investing in fine-tuning; only proceed if there's a real, measured gap prompting can't close.
10. *RLHF vs DPO — compare them.* Both train a model to prefer human-preferred outputs. RLHF trains a separate reward model from human preference judgments, then uses reinforcement learning (commonly PPO) with a KL penalty against the starting model to optimize toward that reward. DPO reframes the same goal as a single supervised-style loss directly on preference pairs, without a separate reward model or RL loop — simpler and more stable to train, though the field continues to evolve here.
11. *How would you evaluate whether a fine-tuning project was worth it?* A rigorous three-way comparison — base model, well-prompted base model, fine-tuned model — on a held-out test set using the real task metric, plus a general-capability regression check, plus real cost/latency numbers at production volume.
12. *A fine-tuned model performs great on your eval set but customers are complaining — what's your hypothesis list?* Held-out eval set doesn't represent real production traffic distribution; chat template mismatch between training and production prompts; catastrophic forgetting on edge cases the eval set didn't cover; data drift since the training set was curated. Investigate with shadow-traffic comparison and by sampling real failing production examples.
`,

  "coding-questions": `
### 1. Implement a minimal LoRA linear layer from scratch (tests understanding of the core mechanism)

~~~python
import torch
import torch.nn as nn

class LoRALinear(nn.Module):
    """Wraps a frozen nn.Linear with a trainable low-rank update."""

    def __init__(self, base: nn.Linear, rank: int = 8, alpha: int = 16, dropout: float = 0.0):
        super().__init__()
        self.base = base
        for p in self.base.parameters():
            p.requires_grad = False  # freeze the original weight and bias

        in_features, out_features = base.in_features, base.out_features
        # A projects down to rank, B projects back up — B starts at zero so the
        # adapter is a true no-op at the start of training
        self.lora_A = nn.Parameter(torch.randn(rank, in_features) * (1 / rank ** 0.5))
        self.lora_B = nn.Parameter(torch.zeros(out_features, rank))
        self.scale = alpha / rank
        self.dropout = nn.Dropout(dropout)

    def forward(self, x: torch.Tensor) -> torch.Tensor:
        base_out = self.base(x)
        lora_out = self.dropout(x) @ self.lora_A.T @ self.lora_B.T
        return base_out + self.scale * lora_out

    def trainable_parameter_count(self) -> int:
        return self.lora_A.numel() + self.lora_B.numel()

# Sanity check: at init, the adapter contributes exactly zero
layer = LoRALinear(nn.Linear(768, 768), rank=8)
x = torch.randn(2, 768)
assert torch.allclose(layer(x), layer.base(x))
~~~

Complexity: forward/backward cost is dominated by the frozen base matmul (out_features x in_features), with a small additional rank-sized matmul; trainable parameter count is rank x (in_features + out_features), typically under 1% of the base layer's parameter count. Follow-ups: how would you merge this back into a single dense layer for deployment (compute base.weight + scale * lora_B @ lora_A and assign it)? How does dropout on the LoRA path help prevent overfitting on small datasets?

### 2. Write a target-token loss mask for SFT (tests understanding of what fine-tuning actually optimizes)

~~~python
def build_training_labels(
    input_ids: list[int],
    response_start_idx: int,
    ignore_index: int = -100,
) -> list[int]:
    """
    Only the assistant's response tokens should contribute to the loss.
    Everything before response_start_idx (system + user turns) is masked
    with ignore_index, which standard cross-entropy loss implementations
    skip during loss computation.
    """
    labels = list(input_ids)
    for i in range(response_start_idx):
        labels[i] = ignore_index
    return labels

# Example: instruction+input tokens occupy indices 0-14, response starts at 15
tokens = list(range(20))
labels = build_training_labels(tokens, response_start_idx=15)
assert labels[:15] == [-100] * 15
assert labels[15:] == tokens[15:]
~~~

Complexity: O(n) in sequence length. Follow-ups: why does masking the prompt tokens matter (without it, the model spends capacity learning to predict its own input, diluting the useful gradient signal on the actual desired behavior)? How would you handle multi-turn conversations where several assistant turns should each contribute to the loss but user turns should not?

### 3. Given eval scores, decide whether to ship a fine-tune (tests the decision-framework discipline, not just code)

~~~python
from dataclasses import dataclass

@dataclass
class EvalResult:
    exact_match: float
    general_capability_score: float   # regression canary, 0-1
    cost_per_1k_calls: float
    latency_p95_ms: float

def should_ship(
    base_prompted: EvalResult,
    finetuned: EvalResult,
    min_quality_gain: float = 0.03,
    max_capability_regression: float = 0.02,
) -> tuple[bool, str]:
    quality_gain = finetuned.exact_match - base_prompted.exact_match
    capability_drop = base_prompted.general_capability_score - finetuned.general_capability_score

    if quality_gain < min_quality_gain:
        return False, "Fine-tuned model does not meaningfully beat the prompted baseline."
    if capability_drop > max_capability_regression:
        return False, "General-capability regression exceeds acceptable threshold — possible catastrophic forgetting."
    if finetuned.cost_per_1k_calls > base_prompted.cost_per_1k_calls and quality_gain < 0.10:
        return False, "Not cheaper and quality gain too small to justify added operational complexity."
    return True, "Ship: quality gain justified, no unacceptable capability regression."
~~~

Complexity: O(1). Follow-ups: how would you incorporate a statistical significance check (the quality gain must be significant given eval set size, not just numerically positive)? What would you add to catch a regression that only shows up on a specific input subgroup rather than in the aggregate score?
`,

  "hands-on-labs": `
### Lab 1 — Build and format an SFT dataset (beginner, ~1.5h)
Take 100 example inputs (e.g. support tickets, or any narrow task text) and write ideal outputs by hand or by careful review. Format them into the exact chat template your chosen base model expects; render 10 of them and manually verify they look correct with special tokens visible. Split into train/val/held-out test (e.g. 70/15/15). Deliverable: a clean, template-correct JSONL dataset with documented splits. Skills exercised: dataset curation discipline, template formatting, the beginner-to-intermediate concepts on this page.

### Lab 2 — Train a LoRA adapter and compare against a prompted baseline (intermediate, ~3h)
Using Hugging Face transformers + PEFT (or a hosted fine-tuning API if GPU access is limited), fine-tune a small open-weight model on Lab 1's dataset. Separately, engineer the best prompt you can for the same task on the same base model. Score both, plus the un-prompted base model, on the held-out test set with the same metric. Deliverable: a three-way comparison table and a written justification (or rejection) of the fine-tune. Skills exercised: the full SFT pipeline, the decision-framework discipline from Advanced Concepts.

### Lab 3 — Probe for catastrophic forgetting and knowledge injection failure (advanced, ~3h)
On your Lab 2 fine-tuned model, run a fixed general-capability prompt set (reasoning, unrelated instruction-following) and compare to the base model. Separately, fine-tune a small model on a set of documents containing specific facts (e.g. invented product specs) and test whether it can accurately recall those facts on held-out questions versus a RAG pipeline over the same documents. Deliverable: a short report demonstrating, with your own numbers, why fine-tuning is unreliable for fact injection and quantifying any capability regression observed. Skills exercised: rigorous evaluation, the honest fine-tuning-vs-RAG distinction that is this page's central lesson.

### Lab 4 — Production-style adapter serving and versioning (production, ~3h)
Take a trained LoRA adapter and set up: (a) adapter-attached serving alongside the frozen base model, (b) a merged standalone checkpoint as an alternative deployment, (c) a versioning scheme recording dataset version, config, and eval scores per checkpoint, (d) a canary comparison harness that scores a new checkpoint against the currently-deployed one on a shared eval set before promoting it. Deliverable: a small serving script plus a versioned adapters/ directory with a README documenting each version's provenance. Skills exercised: the full Production Usage, Deployment, and Production Checklist sections.
`,

  "real-projects": `
Portfolio-grade projects that demonstrate genuine fine-tuning judgment, not just training-script mechanics:

1. **Format-reliability benchmark: fine-tuning vs prompting for structured extraction** — Pick a structured extraction task (e.g. extracting fields from invoices or resumes into a fixed JSON schema). Build both a heavily prompt-engineered baseline and a LoRA fine-tuned model on the same base model. Measure schema-validity rate, field-level accuracy, cost per call, and latency across both, at multiple dataset sizes (100, 500, 2000 examples) to show the data-quality/quantity curve. Demonstrates: the decision-framework discipline, rigorous evaluation, honest reporting of where fine-tuning did and didn't help.

2. **A small multi-tenant fine-tuning platform** — Build a service that accepts a dataset upload per "customer," trains a LoRA adapter, versions it, and serves multiple customers' adapters against one shared frozen base model with adapter multiplexing. Include an automated eval-and-gate step that blocks promotion of a new adapter version if it regresses on a shared general-capability check. Demonstrates: PEFT mechanics, adapter serving architecture, production-grade versioning and gating.

3. **The RAG-vs-fine-tuning knowledge experiment** — Construct a synthetic "knowledge base" of invented facts (so you can be certain the base model has zero prior knowledge of them). Compare three approaches to answering questions about that knowledge: prompting with no context, fine-tuning on the documents, and a RAG pipeline retrieving the documents at query time. Publish exact accuracy numbers for each. Demonstrates: hands-on, first-party evidence for the single most important claim on this page — that fine-tuning is not a reliable knowledge-injection mechanism — which is an unusually strong signal of genuine understanding in an interview setting.

Each project should include: documented dataset curation and provenance, a held-out test set never touched during development, a written three-way comparison against baselines, versioned checkpoints, and a short README explaining the engineering decisions — the judgment demonstrated matters more than the raw training code.
`,

  "case-studies": `
### The recurring "we fine-tuned on our docs and it still hallucinates" story
A pattern reported repeatedly across teams building internal knowledge assistants: a team fine-tunes a model on their internal documentation hoping it will "know" the company's product details, ships it, and finds it confidently gives wrong specs, prices, or policy details that sound fluent but are fabricated. The fix that consistently works is switching to a RAG architecture — retrieving the actual document at query time — while reserving fine-tuning (if used at all) for how the model phrases and formats answers using that retrieved context. Lesson: this is the single most repeated case study in applied fine-tuning practice and is the reason this page leads with the decision framework rather than burying it.

### LoRA's original efficiency claim, validated at scale
The LoRA paper (Hu et al., 2021) demonstrated that adapting large language models with a tiny fraction of trainable parameters could match or approach full fine-tuning quality on a range of tasks. This result is what unlocked the entire modern PEFT ecosystem — without it, fine-tuning large models would still require the same multi-GPU infrastructure full fine-tuning needs, and would remain out of reach for most individual engineers and small teams. Lesson: a single well-evidenced efficiency insight (low intrinsic rank of task adaptation) reshaped an entire field's practice within roughly two years.

### QLoRA making single-GPU fine-tuning of large open models mainstream
QLoRA (Dettmers et al., 2023) showed that combining 4-bit quantization of the frozen base model with LoRA adapters could fine-tune models with tens of billions of parameters on a single consumer-class GPU with quality close to 16-bit fine-tuning. This directly enabled the explosion of community and small-team fine-tunes of open-weight models (Llama, Mistral, and similar families) that followed. Lesson: memory efficiency innovations, not just algorithmic ones, can be the actual bottleneck standing between "theoretically possible" and "practically accessible."

### Provider documentation converging on the same warning
Independently, multiple major model providers' own fine-tuning documentation has repeatedly cautioned users against expecting fine-tuning to reliably add new factual knowledge, and has pointed toward retrieval-based approaches instead. Lesson: when competitors converge on the same caveat without coordinating, it's strong evidence the caveat reflects a real, fundamental property of how these models are trained rather than a niche or provider-specific limitation.
`,

  comparisons: `
| Dimension | Fine-tuning (PEFT) | Prompt Engineering | RAG | DSPy-style prompt optimization | Full fine-tuning |
|-----------|--------------------|--------------------|----|--------------------------------|--------------------|
| Changes model weights | Yes (small adapter) | No | No | No | Yes (all weights) |
| Best for | Style, format, consistent narrow behavior | Quick iteration, general tasks | Injecting current/private facts reliably | Optimizing prompts/few-shot examples systematically against a frozen model | Very large behavioral shifts, rare in practice for adapting existing capable models |
| Iteration speed | Hours (training + eval cycle) | Minutes | Minutes to hours (index build) | Minutes to hours (no GPU training needed) | Days (compute + infra heavy) |
| Infra required | GPU (often just one, via PEFT) or hosted API | None beyond the model API | Vector store/retrieval infra | None beyond the model API | Multi-GPU / cluster, typically |
| Per-call cost after setup | Low — behavior is built in, short prompts suffice | Can be high if long few-shot prompts are needed every call | Moderate — retrieval + longer context per call | Low to moderate — optimized prompt still sent per call | Low, same as PEFT once trained |
| Reliability for facts | Low — not built for this | Depends on what's in context | High — this is its purpose | Depends on what's in context | Low — same limitation as PEFT here |
| Explainability | Low — behavior baked into opaque weights | High — you control the prompt directly | High — can cite the retrieved source | High — the prompt program is inspectable | Low |

**How seniors choose**: diagnose the actual failure mode before picking a lever. Wrong or missing facts → RAG. Inconsistent style/format/behavior with enough data to teach it → fine-tuning (PEFT by default). Need to iterate fast or don't have training data yet → prompting, possibly systematized with DSPy-style optimization. Very high call volume where per-call prompt length is a real cost driver → fine-tuning to shrink the prompt. Most mature production systems combine several of these rather than picking exactly one.
`,

  "related-technologies": `
- **LLM Fundamentals** — the prerequisite for this entire page: what tokens, embeddings, and next-token prediction are, and why weight-based "knowledge" behaves the way it does. Read this first if you haven't.
- **Deep Learning** — covers the backpropagation and gradient-descent mechanics that every fine-tuning run relies on; this page assumes but does not re-derive that math.
- **Prompt Engineering** — the cheaper, faster-iterating alternative lever this page constantly compares against; always the first thing to exhaust before fine-tuning.
- **DSPy** — optimizes prompts and few-shot examples against a frozen model rather than changing weights; see the honest comparison in Advanced Concepts.
- **Inference** — covers quantization as a general serving technique; QLoRA's quantization ideas overlap directly with inference-time quantization.
- **Serving** — covers how to actually run a fine-tuned model (and multiple adapters) in production at scale, including adapter multiplexing.
- **Evaluation** — the broader discipline of building rigorous LLM evaluation harnesses that this page's three-way-comparison methodology depends on.
- **Hallucination** — directly related to the "fine-tuning can't reliably inject facts" theme; understanding why models hallucinate clarifies why gradient descent on a small dataset doesn't fix it.
- **Guardrails** — fine-tuning does not replace guardrails; a fine-tuned model still needs the same output validation and safety layers as any deployed model.
- **Hugging Face PEFT / Axolotl / Unsloth** — the practical open-source libraries and wrappers used to actually run LoRA/QLoRA training jobs.

Natural next pages on this platform, in order: **LLM Fundamentals** → **Deep Learning** → **Fine-Tuning** (this page) → **Inference** → **Serving** → **Evaluation** → **Hallucination** → **Guardrails**.
`,

  "latest-updates": `
Knowledge cutoff honesty: this section reflects the state of the field as broadly understood through early-to-mid 2026 and should be checked against current provider documentation and recent papers before making a technique choice for a real project, since this is one of the faster-moving corners of applied LLM engineering.

As of this writing, the broad, stable trends are: PEFT techniques (LoRA and QLoRA) remain the default approach for adapting existing capable models, rather than full fine-tuning, for the vast majority of real-world use cases. Hosted fine-tuning APIs from major model providers have made fine-tuning accessible without owning GPU infrastructure, typically built on PEFT-style techniques under the hood even when not disclosed in detail. Preference-optimization techniques (DPO and its variants) have become common alternatives to full RLHF/PPO pipelines for teams without dedicated RL infrastructure, though RLHF-style approaches remain in use, particularly at the largest labs building frontier general-purpose models. The field continues to produce new PEFT variants and preference-optimization refinements at a fast pace; treat any specific named technique's status as "the current best practice" as something to verify at the time you are reading this, rather than as a permanently fixed fact from this page.

For the most current and authoritative information, check: the documentation of whichever model provider or open-weight model family you plan to fine-tune, the Hugging Face PEFT library's release notes and documentation, and recent papers from major AI labs on preference optimization and parameter-efficient adaptation — rather than relying solely on this page for anything version- or date-sensitive.
`,

  "future-roadmap": `
Directions worth watching, stated with appropriate hedging since this is a fast-moving area:

- **Continued efficiency gains in PEFT**: expect further reductions in the memory and compute needed to fine-tune ever-larger base models, following the LoRA-to-QLoRA trajectory of combining low-rank adaptation with more aggressive quantization and other compression techniques.
- **Better tooling for the "which lever do I pull" decision itself**: as the fine-tuning-vs-RAG-vs-prompting distinction has become widely understood as a real engineering decision (not just a fine-tuning footnote), expect more structured frameworks, benchmarks, and even automated advisors to help teams choose correctly before investing in a training run.
- **Tighter integration between fine-tuning and evaluation tooling**: expect fine-tuning platforms to increasingly bundle the three-way comparison (base, prompted, fine-tuned) and general-capability regression testing described in this page as a built-in step, rather than something teams have to assemble themselves.
- **Preference-optimization technique consolidation or fragmentation**: it is genuinely unclear, from today's vantage point, whether the field converges on one dominant successor to RLHF/DPO or continues to fragment into task-specific variants — worth tracking rather than betting career time on any single named technique.
- **Where to bet career time**: the durable, technique-independent skills are the decision framework (when fine-tuning is and isn't the right lever), rigorous evaluation discipline, and data quality curation — these will outlive whichever specific library or algorithm is fashionable at any given moment. The specific tool (LoRA today, something else tomorrow) is far more likely to change than the underlying judgment this page teaches.
`,

  "cheat-sheet": `
~~~text
FINE-TUNING — THE ESSENTIALS

WHAT IT IS
  Continue training a pretrained model's weights on a small, curated,
  task-specific dataset to teach STYLE / FORMAT / DOMAIN BEHAVIOR reliably.

WHEN TO USE IT (decision framework)
  Wrong/missing facts?              -> RAG, not fine-tuning
  Inconsistent style/format/tone?    -> Fine-tuning
  Requirements change often?         -> Prompting / RAG (fast iteration)
  Long, expensive, fragile prompt?   -> Fine-tuning (bake it in) or DSPy
  Enough high-quality examples?      -> Fine-tuning viable; if not, prompt/few-shot

FULL FINE-TUNING vs PEFT
  Full: update ALL weights           -> huge memory/compute, rarely needed
  PEFT (LoRA/QLoRA): freeze base,
    train <1% new params             -> default in real practice

LoRA MECHANICS
  Freeze W. Learn A (rank x in), B (out x rank). B init = 0 (no-op at start).
  Effective output = W(x) + scale * B(A(x))
  Works because task adaptation has LOW INTRINSIC RANK.

QLoRA
  LoRA + 4-bit quantized frozen base (e.g. NF4) -> ~4x less base memory.

SFT PIPELINE
  Curate data -> format to exact chat template -> mask loss to response
  tokens only -> train few epochs, low LR -> eval vs base + vs prompted.

RLHF vs DPO (hedge: fast-moving area, verify current practice)
  RLHF: reward model + RL (PPO) + KL penalty to starting model.
  DPO:  single supervised-style loss directly on preference pairs.
  Both: teach model to prefer human-preferred outputs.

RISKS
  Catastrophic forgetting -> mitigate: PEFT, low LR, few epochs,
    mix general data, test general-capability regression.
  Dataset quality dominates outcome more than almost anything else in ML.

PRODUCTION
  Always compare: base model vs well-prompted base vs fine-tuned.
  Version every checkpoint with dataset version + config + eval scores.
  Serve via adapter-attached (flexible) or merged (simple) deployment.
~~~
`,

  "flash-cards": `
| Question | Answer |
|----------|--------|
| What is fine-tuning in one line? | Continuing training of a pretrained model on a smaller task-specific dataset to teach consistent style, format, or domain behavior. |
| Fine-tuning is good for teaching what, and bad for teaching what? | Good for style/format/behavior; bad/unreliable for injecting new factual knowledge — that's RAG's job. |
| What does PEFT stand for and why does it dominate practice? | Parameter-Efficient Fine-Tuning; it trains a tiny fraction of parameters, avoiding the huge memory/compute cost of full fine-tuning. |
| What does LoRA freeze and what does it train? | Freezes the original weight matrix; trains two small low-rank matrices (A and B) whose product is added to the frozen output. |
| Why are low-rank updates often sufficient? | The change needed to adapt a model to a narrow task empirically has low intrinsic rank — it lives in a small subspace, not the full weight space. |
| What is QLoRA? | LoRA combined with quantizing the frozen base model's weights (e.g. to 4-bit) for further memory reduction. |
| What is SFT? | Supervised Fine-Tuning — training on curated instruction/response pairs with the loss computed only on response tokens. |
| What is RLHF at a conceptual level? | Train a reward model from human preference judgments, then use reinforcement learning to shape the model toward outputs that reward model scores highly. |
| What is DPO and how does it differ from RLHF? | Direct Preference Optimization — a single supervised-style loss directly on chosen-vs-rejected preference pairs, without a separate reward model or RL loop. |
| What is catastrophic forgetting? | A fine-tuned model losing general capability while gaining the specific behavior it was tuned for. |
| Name two mitigations for catastrophic forgetting. | Use PEFT instead of full fine-tuning; use a low learning rate/few epochs and mix in general instruction data. |
| What is the dominant factor in fine-tuning success? | Dataset quality — far more than dataset size or hyperparameter tuning. |
| What must you always compare a fine-tuned model against before shipping? | The base model and a well-prompted version of the base model, on the same held-out test set. |
| What is the difference between fine-tuning and DSPy-style optimization? | Fine-tuning changes model weights; DSPy optimizes the prompt/few-shot examples against a frozen model. |
| What are the two deployment shapes for a LoRA adapter? | Merged (folded into base weights, standalone) or adapter-attached (frozen base + separate adapter loaded at inference). |
`,

  mcqs: `
1. A team wants their support bot to always know the current return policy, which changes monthly. What should they do?
   A) Fine-tune monthly on the updated policy document
   B) Use RAG to retrieve the current policy at query time
   C) Increase the LoRA rank
   D) Switch to full fine-tuning
   **Answer: B.** Frequently-changing facts belong in a retrieval layer, not baked into weights via fine-tuning — fine-tuning monthly would be slow, costly, and still unreliable for exact current facts.

2. Why does LoRA use two matrices (A and B) instead of directly updating the full weight matrix?
   A) It's a historical accident with no technical reason
   B) The full matrix update is numerically unstable
   C) Task adaptation empirically has low intrinsic rank, so a low-rank product captures most of the useful update with far fewer trainable parameters
   D) Two matrices are required by the transformer architecture
   **Answer: C.** This is LoRA's core insight and the reason it works.

3. What does QLoRA add on top of standard LoRA?
   A) A second adapter for redundancy
   B) Quantization of the frozen base model's weights, reducing memory further
   C) A reward model for reinforcement learning
   D) Full fine-tuning of the base weights
   **Answer: B.** QLoRA combines LoRA with 4-bit quantization of the frozen base, not with any RL component.

4. A fine-tuned model performs great on its own training examples but gives wrong answers to slightly rephrased versions of the same questions on a held-out set. What is the most likely explanation?
   A) The learning rate was too low
   B) The model overfit / memorized rather than generalized, likely from too many epochs on too small or too narrow a dataset
   C) The adapter rank was too low
   D) This is expected and not a problem
   **Answer: B.** This is a classic overfitting signature; reduce epochs, increase data diversity, and check validation loss.

5. Which of the following best describes the difference between fine-tuning and DSPy-style prompt optimization?
   A) They are the same technique with different names
   B) Fine-tuning changes model weights; DSPy optimizes the prompt and few-shot examples against a frozen model
   C) DSPy is a replacement for GPUs
   D) Fine-tuning is always faster to iterate on than DSPy
   **Answer: B.** DSPy explicitly keeps the model frozen and treats the prompt as the trainable artifact — a genuinely different lever, and typically much faster to iterate on than a training run.

6. What is the primary reason PEFT dominates real-world fine-tuning practice over full fine-tuning?
   A) PEFT always produces higher quality models
   B) Full fine-tuning of a large model requires memory and compute most teams don't have or need, while PEFT captures most of the benefit with a tiny fraction of trainable parameters
   C) Full fine-tuning is not supported by modern libraries
   D) PEFT is required by law for commercial models
   **Answer: B.** It's an efficiency argument, not a pure quality argument — full fine-tuning can still edge out PEFT in some cases, but the cost/benefit strongly favors PEFT for adapting already-capable base models.
`,

  "revision-notes": `
Fine-tuning continues training a pretrained model's weights on a small, curated, task-specific dataset to make it reliably produce a desired style, format, or domain behavior. The single most important discipline in this skill is knowing when NOT to fine-tune: fine-tuning is for teaching HOW a model should respond (consistency, structure, tone), not WHAT is true — reliable factual grounding, especially for current or private information, is RAG's job, not fine-tuning's, and confusing the two is the most common and expensive mistake in the field.

Full fine-tuning updates every parameter and requires memory and compute most teams don't have or need; parameter-efficient fine-tuning (PEFT), especially LoRA, dominates real practice by freezing the base model and training a small low-rank update instead, because task adaptation empirically lives in a low-rank subspace of the full weight space. QLoRA adds quantization of the frozen base model on top of LoRA, cutting memory further and making fine-tuning of very large models feasible on a single GPU.

The standard supervised fine-tuning (SFT) pipeline is: curate a high-quality instruction/response dataset, format it to match the base model's exact chat template, mask the loss so it only applies to response tokens, train for a small number of epochs at a low learning rate, and evaluate rigorously against both the base model and a well-prompted baseline on a held-out test set that was never touched during curation. RLHF and DPO are conceptually about training a model to prefer human-preferred outputs — RLHF via a separate reward model and reinforcement learning, DPO via a single supervised-style loss directly on preference pairs — and this is an area that moves quickly enough to require checking current sources rather than trusting any one technique as permanently standard.

Catastrophic forgetting is a real risk: a fine-tuned model can lose general capability while gaining its specific new behavior, mitigated by preferring PEFT over full fine-tuning, using conservative learning rates and epoch counts, mixing in general instruction data, and explicitly testing general-capability regression alongside the task metric. Dataset quality is the dominant factor in fine-tuning success — more than dataset size, more than hyperparameter tuning — so curation, deduplication, and format validation deserve more engineering time than the training run itself.

In production, never ship a fine-tune without a rigorous three-way comparison (base model, well-prompted base model, fine-tuned model) on a real held-out set, version every checkpoint with its dataset version and evaluation scores, decide deliberately between merged and adapter-attached serving depending on whether you need to serve many task-specific variants against a shared base model, and remember that fine-tuning does not exempt a model from the same guardrails, monitoring, and re-evaluation discipline every other production model requires.
`,

  "learning-roadmap": `
**Week 1 — Foundations and the decision framework.** Read Overview through Prerequisites and Beginner Concepts. Make sure the LLM Fundamentals prerequisite is solid before continuing. Milestone: you can explain, without looking it up, why fine-tuning is not reliable for injecting new facts and what to use instead.

**Week 2 — Mechanics of LoRA and QLoRA.** Work through Intermediate and Advanced Concepts and Internal Working. Implement the from-scratch LoRALinear layer in Coding Questions. Milestone: you can explain, mechanically, why low-rank updates are often sufficient and draw the frozen-weights-plus-adapter diagram from memory.

**Week 3 — Full SFT pipeline, hands-on.** Complete Hands-on Labs 1 and 2 — curate a dataset, format it correctly, train a LoRA adapter, and run a genuine three-way comparison against a prompted baseline. Read Production Usage, Testing, and Common Mistakes closely while doing this. Milestone: you have real numbers from your own experiment showing whether fine-tuning beat prompting on your chosen task.

**Week 4 — Risk, evaluation rigor, and production concerns.** Complete Hands-on Lab 3 (catastrophic forgetting and knowledge-injection probing) and Lab 4 (production serving and versioning). Read Security, Monitoring, Deployment, and the Production Checklist. Milestone: you can defend, with evidence, a ship/no-ship decision for a fine-tuning project the way a senior engineer would in a design review.

**Ongoing — interview and ecosystem readiness.** Work through Interview Questions, MCQs, and Flash Cards for retention. Read Comparisons and Related Technologies to place fine-tuning correctly alongside prompting, RAG, and DSPy in your mental model.

Next platform skill: once fine-tuning's tradeoffs are second nature, move to **Inference** to understand how any model — base or fine-tuned — is actually served efficiently at request time, then **Serving** for the surrounding production infrastructure.
`,

  "official-docs": `
- **Hugging Face PEFT documentation** — the primary open-source reference for LoRA, QLoRA, and related parameter-efficient fine-tuning techniques; includes practical configuration guides and API references. Check the current version's docs directly, since APIs evolve.
- **Hugging Face transformers documentation** — the base library PEFT builds on top of; relevant for tokenization, chat templates, and the Trainer API used in most fine-tuning scripts.
- **Model provider fine-tuning API documentation** (e.g. OpenAI's fine-tuning guide, Anthropic's enterprise fine-tuning documentation where available) — the authoritative source for hosted fine-tuning specifics, supported models, dataset format requirements, and current pricing; these change frequently and should always be checked directly rather than assumed from this page.
- **bitsandbytes documentation** — the library implementing the quantization techniques (including NF4) that QLoRA relies on.

Always verify exact current API parameters, supported model lists, and pricing against these live sources rather than this page, since hosted offerings and library APIs change on a timescale faster than this content is updated.
`,

  books: `
- **"Deep Learning" by Ian Goodfellow, Yoshua Bengio, and Aaron Courville** — the foundational deep learning text; essential background for understanding the gradient-descent mechanics fine-tuning relies on (paired with the Deep Learning skill on this platform).
- **"Natural Language Processing with Transformers" by Lewis Tunstall, Leandro von Werra, and Thomas Wolf** — written by Hugging Face engineers, covers fine-tuning transformer models hands-on with the actual libraries (transformers, and the PEFT ecosystem it later grew) used in real practice.
- **"Designing Machine Learning Systems" by Chip Huyen** — not fine-tuning-specific, but essential for the production discipline (evaluation rigor, data quality focus, monitoring) this page repeatedly emphasizes as more important than the training mechanics themselves.
- **"Hands-On Large Language Models" by Jay Alammar and Maarten Grootendorst** — accessible, visual explanations of transformer internals and adaptation techniques including fine-tuning approaches, good for building intuition before diving into papers.

Honest note: fine-tuning technique specifics (LoRA, QLoRA, DPO) move faster than book publishing cycles — treat books as the place to build durable conceptual foundations, and treat the original papers plus current library documentation as the place to get today's exact technique details.
`,

  blogs: `
- **The Hugging Face blog** — regularly publishes practical, hands-on posts on PEFT, LoRA, QLoRA, and fine-tuning workflows with runnable code; the highest-signal source for staying current on open-source fine-tuning tooling.
- **Sebastian Raschka's blog and newsletter (Ahead of AI)** — consistently clear, technically rigorous explanations of fine-tuning techniques (LoRA internals, DPO vs RLHF comparisons) aimed at practitioners who want to actually understand the mechanics, not just run a script.
- **Lilian Weng's blog (while at OpenAI)** — deep, well-cited technical explainers covering RLHF, preference optimization, and related alignment techniques at a level suitable for building real understanding beyond a surface summary.
- **Model provider engineering blogs** (OpenAI, Anthropic, and similar) — periodically publish posts on their fine-tuning offerings and the reasoning behind design choices; useful for understanding how the theory in this page maps to what's actually offered as a product.

Treat blog content on specific technique comparisons (e.g. "DPO vs RLHF in 2026") as time-stamped opinions to verify against current papers and documentation, not permanent facts.
`,

  "research-papers": `
This is a topic with real, foundational, well-known papers rather than a thin literature — the following are the ones worth reading directly:

- **"LoRA: Low-Rank Adaptation of Large Language Models" (Hu et al., 2021)** — the original LoRA paper; essential reading, directly explains the low-rank intrinsic dimensionality argument this page relies on throughout Advanced Concepts and Internal Working.
- **"QLoRA: Efficient Finetuning of Quantized LLMs" (Dettmers et al., 2023)** — introduces QLoRA and the NF4 quantization data type; the direct source for the memory-efficiency claims in this page.
- **"Training language models to follow instructions with human feedback" (Ouyang et al., 2022 — the InstructGPT paper)** — the canonical RLHF-for-LLMs paper; foundational for understanding what RLHF actually does and why it emerged.
- **"Direct Preference Optimization: Your Language Model is Secretly a Reward Model" (Rafailov et al., 2023)** — the original DPO paper; the direct source for the RLHF-vs-DPO comparison in Advanced Concepts and FAQs.
- **"Universal Language Model Fine-tuning for Text Classification" (Howard and Ruder, 2018 — ULMFiT)** — historically foundational for the pretrain-then-fine-tune paradigm in NLP, useful for understanding where the modern approach came from.

If you want the closest foundational reading beyond these direct papers: the original **"Attention Is All You Need"** (Vaswani et al., 2017) transformer paper and the **BERT** paper (Devlin et al., 2018) are worth reading for the architecture being fine-tuned in the first place, though they are covered more directly in the **LLM Fundamentals** and **Deep Learning** skills.
`,

  videos: `
- **Andrej Karpathy's "Let's build GPT" and related deep-learning lecture series** — not fine-tuning-specific, but essential for building the from-scratch intuition of the transformer and training loop that every fine-tuning technique operates on top of.
- **Hugging Face's official YouTube tutorials on PEFT and fine-tuning** — practical, code-along walkthroughs of LoRA/QLoRA fine-tuning using their libraries, closest to what you'll actually type in practice.
- **Conference talks on RLHF and DPO from major ML conferences (NeurIPS, ICML)** — search for the original authors presenting the InstructGPT and DPO papers directly; hearing the authors explain the motivation is often clearer than the paper's prose alone.

Honest note: specific creator/channel recommendations age quickly in this space — prioritize searching for recent (last 12 months at time of viewing) talks and tutorials from the library maintainers (Hugging Face) and the original paper authors over any single fixed recommendation.
`,

  "github-repos": `
- **huggingface/peft** — the standard open-source library for LoRA, QLoRA, and other parameter-efficient fine-tuning techniques; the practical starting point for almost any self-managed fine-tuning project.
- **huggingface/transformers** — the base model and training library PEFT builds on top of; needed for loading base models, tokenizers, and running the Trainer loop.
- **artidoro/qlora** — the original QLoRA paper's reference implementation; useful for seeing the exact quantization and training setup described in the paper.
- **OpenAccess-AI-Collective/axolotl** — a popular higher-level wrapper around transformers/PEFT that simplifies configuring and running fine-tuning jobs via YAML configs, widely used in the open-weight fine-tuning community.
- **unslothai/unsloth** — a performance-focused fine-tuning library that significantly speeds up and reduces memory for LoRA/QLoRA training on popular open-weight models.
- **eric-mitchell/direct-preference-optimization** — a reference implementation associated with the DPO paper, useful for seeing the preference-pair training loop concretely.
- **bitsandbytes-foundation/bitsandbytes** — the quantization library underlying QLoRA's 4-bit base model loading.
- **trl (huggingface/trl)** — Hugging Face's library specifically for RLHF- and DPO-style training loops (reward modeling, PPO, DPO trainers) on top of transformers.

Always check each repo's current README and recent commit activity before depending on it for a real project — this ecosystem's tooling evolves quickly.
`,

  "practice-problems": `
Ordered by skill focus, building from mechanics to judgment:

1. **Mechanics**: implement the LoRALinear layer from scratch (see Coding Questions) and verify numerically that it produces a true no-op at initialization.
2. **Data pipeline**: given a set of raw examples, write a script that deduplicates, formats to a chat template, and splits into train/val/held-out test with zero leakage — verify leakage programmatically, not by eye.
3. **Loss masking**: implement and unit-test a function that masks the loss to only the assistant response tokens across a multi-turn conversation.
4. **Decision framework**: given five short scenario descriptions (a changing-facts helpdesk, a style-consistency writing assistant, a rare custom output format, a one-off small task, a highly dynamic requirements environment), classify each as best solved by fine-tuning, prompting, RAG, or a combination, and justify each choice in one sentence.
5. **Evaluation**: build the three-way comparison harness (base, well-prompted base, fine-tuned) from Testing and run it against a real small dataset, reporting whether the fine-tune was actually justified.
6. **Forgetting detection**: design and run a fixed general-capability regression suite against a model before and after fine-tuning, and quantify any regression observed.
7. **External practice sets**: Hugging Face's course modules on fine-tuning and PEFT include hands-on notebooks with exercises; working through them end to end is excellent applied practice alongside this page's labs.

Treat problem 4 (the decision framework) as the one most worth returning to repeatedly — it is the judgment this entire page is built around, and it's the one senior interviewers probe hardest.
`,

  "architecture-diagram": `
~~~mermaid
flowchart TB
    subgraph Ingest["Data layer"]
        Raw["Raw task examples"]
        Curate["Curation, dedup, PII scrub"]
        Template["Chat-template formatting"]
        Splits["train / val / held-out test"]
    end

    subgraph Train["Training layer (PEFT / QLoRA)"]
        BaseFrozen["Frozen base model\\n(optionally 4-bit quantized)"]
        Adapter["LoRA adapter (trainable)"]
        Loop["Training loop: forward, masked loss,\\nbackward, optimizer step on adapter only"]
    end

    subgraph EvalGate["Evaluation gate"]
        ThreeWay["Compare: base vs prompted-base vs fine-tuned"]
        Capability["General-capability regression check"]
        Decision{"Ship?"}
    end

    subgraph Serve["Serving layer"]
        Merge["Merge adapter into base\\n(standalone checkpoint)"]
        Attach["Or: keep adapter separate,\\nmultiplex over shared frozen base"]
        Guard["Guardrails + monitoring\\n(same as any production model)"]
        RAGLayer["RAG layer for facts\\n(kept separate from fine-tuned behavior)"]
    end

    Raw --> Curate --> Template --> Splits --> Loop
    BaseFrozen --> Loop
    Adapter --> Loop
    Loop --> ThreeWay
    ThreeWay --> Capability --> Decision
    Decision -- yes --> Merge
    Decision -- yes --> Attach
    Decision -- no --> Curate
    Merge --> Guard
    Attach --> Guard
    RAGLayer --> Guard
~~~

This is the reference production architecture: fine-tuning is one gated stage in a larger pipeline that always includes rigorous evaluation before shipping, and always sits alongside — not instead of — a RAG layer for facts and a guardrails layer for safety.
`,

  "mind-map": `
~~~mindmap
root((Fine-Tuning))
  What and Why
    Continues training on curated task data
    Teaches style, format, domain behavior
    NOT for injecting new facts (use RAG)
  Full vs PEFT
    Full fine-tuning updates all weights
      Huge memory/compute
      Rarely needed for adapting existing models
    PEFT dominates practice
      Freeze base, train small adapter
  LoRA
    Freeze W, learn low-rank A and B
    B initialized to zero (no-op at start)
    Works because updates have low intrinsic rank
  QLoRA
    LoRA plus 4-bit quantized frozen base
    Enables single-GPU fine-tuning of large models
  SFT Pipeline
    Curate high-quality dataset
    Format to exact chat template
    Mask loss to response tokens only
    Train few epochs, low learning rate
    Evaluate vs base and vs prompted baseline
  Alignment Techniques
    RLHF
      Reward model plus RL (PPO) plus KL penalty
    DPO
      Direct supervised-style loss on preference pairs
      Simpler, more stable than full RLHF
  Risks
    Catastrophic forgetting
      Mitigate with PEFT, low LR, general data mix
    Dataset quality dominates outcomes
  Production
    Three-way comparison before shipping
    Version every checkpoint
    Merged vs adapter-attached serving
    Guardrails and monitoring still required
  Ecosystem
    Prompt Engineering as the cheaper first lever
    RAG for facts
    DSPy for frozen-model prompt optimization
    Serving and Inference for running it at scale
~~~
`,
};

export default fineTuning;
