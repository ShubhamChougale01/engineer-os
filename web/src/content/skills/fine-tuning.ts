import type { SkillContent } from "../types";

const fineTuning: SkillContent = {
  overview: `
Fine-tuning is the process of further training a pretrained large language model on a smaller, task-specific or domain-specific dataset, directly updating the model's weights to adapt its behavior — the more expensive, more powerful alternative to prompt engineering (covered in the immediately preceding skill), reserved specifically for cases where prompting alone genuinely cannot achieve the needed reliability, consistency, or domain-specific knowledge at production scale. This skill covers the full modern fine-tuning toolkit: Supervised Fine-Tuning (SFT), parameter-efficient techniques like LoRA that dramatically reduce the cost of adaptation, and Reinforcement Learning from Human Feedback (RLHF), the technique that transformed raw pretrained language models into the helpful, aligned assistants (like ChatGPT and Claude) most people actually interact with.

This is a direct, practical application of the **Deep Learning** skill's own transfer learning concept, applied specifically to large language models — rather than training a model from scratch (prohibitively expensive for virtually any organization), fine-tuning starts from an already-pretrained model's rich, general capabilities and adapts them, typically requiring dramatically less data and compute than training from scratch would. Understanding when fine-tuning is genuinely necessary (versus when prompt engineering would suffice), and which specific fine-tuning technique fits a given situation's data scale and resource constraints, is essential, senior-level AI engineering judgment.

Key characteristics: **Supervised Fine-Tuning (SFT)**, training on labeled input-output examples to adapt a model's behavior for a specific task or domain; **LoRA (Low-Rank Adaptation)**, a parameter-efficient fine-tuning technique that trains only a small number of additional parameters rather than the entire model, dramatically reducing cost; **RLHF (Reinforcement Learning from Human Feedback)**, the technique that aligns a model's outputs with human preferences, directly responsible for transforming raw pretrained models into genuinely helpful, safe assistants; and **the fine-tuning-versus-prompting decision**, a genuinely important, senior-level judgment call directly connecting to the **Prompt Engineering** skill's own escalation-order guidance.
`,

  history: `
| Year | Milestone |
|------|-----------|
| 2018 | **GPT** (OpenAI) and **BERT** (Google) both demonstrate that pretraining a Transformer on a large, general text corpus and then fine-tuning on a smaller, task-specific dataset dramatically outperforms training a model from scratch for a given task |
| 2020 | **GPT-3**'s emphasis on few-shot prompting (covered in the **Prompt Engineering** skill) temporarily shifts significant attention away from fine-tuning, since a single model could handle many tasks purely through prompting |
| 2021 | **Hu et al.** introduce **LoRA (Low-Rank Adaptation)**, a parameter-efficient fine-tuning technique dramatically reducing the compute and memory required to fine-tune a large model, by training only a small number of additional, low-rank parameters rather than the full model |
| 2022 | **InstructGPT** (OpenAI) demonstrates that a comparatively small amount of RLHF-based fine-tuning could make a language model dramatically more helpful, honest, and aligned with actual human preferences than a much larger model without this fine-tuning — directly setting the stage for ChatGPT |
| 2022 | **ChatGPT**'s release, built on RLHF-fine-tuned models, brings the practical, dramatic benefits of alignment-focused fine-tuning to mainstream, widespread public attention |
| 2023 | **QLoRA** further extends LoRA's efficiency by combining it with quantization (directly connecting to the **Vector Search** skill's own treatment of quantization concepts, here applied to model weights), letting even very large models be fine-tuned on comparatively modest, widely-available hardware |
| 2023–2024 | **Direct Preference Optimization (DPO)** and similar techniques emerge as simpler, more stable alternatives to traditional RLHF's reinforcement learning machinery, achieving comparable alignment benefits with reduced implementation complexity |

Fine-tuning's history reflects a genuine, ongoing tension and complementary relationship with prompt engineering — while GPT-3's prompting capabilities briefly seemed to reduce fine-tuning's practical necessity, the parallel development of RLHF (demonstrating fine-tuning's unique, essential role in ALIGNMENT specifically) and LoRA (dramatically lowering fine-tuning's cost barrier) firmly re-established fine-tuning as an essential, complementary technique alongside prompting, not a competing or obsolete alternative to it.
`,

  "why-it-exists": `
Fine-tuning exists because prompt engineering, despite being the fast, low-cost first lever an AI engineer should reach for (covered in the previous skill), has genuine, real limits: it cannot teach a model fundamentally new knowledge the base model's training never included; it cannot guarantee consistent, reliable behavior across an extremely large volume of production requests as reliably as directly updating the model's own weights can; and it's constrained by context window size, limiting how many examples or how much instruction can practically be included in any single request.

Fine-tuning solves these specific limitations by directly, permanently updating the model's own weights based on a training dataset — rather than re-explaining the desired behavior in every single prompt, the desired pattern becomes baked directly into the model itself, requiring no ongoing context-window budget for examples and providing generally stronger, more consistent behavioral guarantees than prompting alone can achieve. This is precisely why RLHF specifically was essential (not merely helpful) for creating genuinely aligned, helpful AI assistants — no amount of clever prompting of a RAW, non-aligned pretrained model reliably produces the consistent helpfulness, honesty, and safety that RLHF-based fine-tuning directly, deliberately trains into the model's own behavior.
`,

  "problem-it-solves": `
Fine-tuning solves the **"how do we adapt a pretrained language model's actual behavior/knowledge more deeply and reliably than prompting alone can achieve, without training an entirely new model from scratch"** problem.

Concretely, it provides:

- **Deeper, more permanent behavioral adaptation**: directly updating model weights produces more consistent, reliable behavior across a large volume of production use than prompting alone typically achieves.
- **Domain-specific knowledge injection**: fine-tuning on domain-specific text (legal, medical, and others) can improve a model's fluency and accuracy with specialized terminology and concepts poorly represented in general pretraining data.
- **Parameter-efficient adaptation via LoRA**: training only a small number of additional, low-rank parameters (rather than the entire model) dramatically reduces the compute, memory, and storage cost of fine-tuning, making it practically accessible to a far broader range of organizations than full fine-tuning would allow.
- **Alignment via RLHF/DPO**: directly training a model's outputs to match human preferences for helpfulness, honesty, and safety — a genuinely essential technique that prompting alone cannot reliably substitute for.

What fine-tuning does **not** solve, or solves only with genuine, unavoidable tradeoffs: fine-tuning requires a genuine, often substantial UPFRONT investment (data collection/labeling, compute, and time) compared to prompting's near-instant iteration; a poorly-designed or insufficiently-sized fine-tuning dataset can cause CATASTROPHIC FORGETTING (the model losing some of its original, general capabilities while adapting to the new, narrower task) — directly connecting to the **Machine Learning** skill's own bias-variance/overfitting concerns; and fine-tuning doesn't eliminate hallucination (covered in its own later skill) — a fine-tuned model can still confidently generate incorrect content, just potentially with different, task-specific failure patterns than the base model.
`,

  "learning-objectives": `
By the end of this page you should be able to:

1. Explain Supervised Fine-Tuning (SFT) and when it's appropriate versus prompt engineering alone.
2. Explain LoRA's parameter-efficient approach and why it dramatically reduces fine-tuning cost.
3. Explain RLHF's role in aligning a model's behavior with human preferences, and why it's distinct from SFT.
4. Explain catastrophic forgetting and how to mitigate it.
5. Compare full fine-tuning, LoRA, and QLoRA and their appropriate use cases.
6. Recognize fine-tuning anti-patterns: fine-tuning when prompting would suffice, insufficient/unrepresentative training data, ignoring catastrophic forgetting risk.
7. Answer senior-level interview questions on the fine-tuning-versus-prompting decision and RLHF's mechanics.
`,

  prerequisites: `
- **Required**: the **Prompt Engineering** skill (covered immediately before this one) — fine-tuning is the escalation path when prompting alone proves insufficient.
- **Required**: the **Deep Learning** skill — fine-tuning is a direct, specific application of transfer learning, covered there generally.
- **Very helpful**: the **Machine Learning** skill's own bias-variance/overfitting treatment, directly relevant to understanding catastrophic forgetting.

Dependency chain: **Prompt Engineering** → this page (Fine-Tuning) → **Inference** for the next skill in this category.
`,

  "beginner-concepts": `
### Supervised Fine-Tuning (SFT): the basic idea

~~~
Start with a PRETRAINED model (already trained on a vast,
general text corpus). Continue training it on a SMALLER,
task-specific dataset of labeled input-output examples,
directly updating the model's weights via ordinary gradient
descent (directly reusing the Deep Learning skill's own
training-loop mechanics), so the model's behavior shifts
toward the patterns demonstrated in this new, more focused dataset.
~~~

### A simple SFT training example (conceptual)

~~~python
training_data = [
    {"input": "Summarize: [long article]", "output": "[concise summary]"},
    {"input": "Summarize: [another article]", "output": "[another summary]"},
    # ... many more examples
]
fine_tuned_model = fine_tune(pretrained_model, training_data, epochs=3)
~~~

### Why fine-tuning generally requires much less data than training from scratch

~~~
The PRETRAINED model already has broad, general language
understanding and world knowledge, learned from a vast
training corpus -- fine-tuning only needs to ADAPT this
already-substantial capability toward a specific task or
style, rather than learning language and general knowledge
from nothing, directly reusing the Deep Learning skill's own
transfer learning motivation.
~~~

### RLHF, at a very high level

~~~
Reinforcement Learning from Human Feedback trains a model
using feedback from HUMAN reviewers rating/comparing different
model outputs for helpfulness, honesty, and safety -- rather
than simply imitating a fixed dataset of "correct" answers (as
SFT does), RLHF directly optimizes the model's behavior toward
whatever HUMANS actually judge to be preferable, a genuinely
different training signal than standard SFT.
~~~
`,

  "intermediate-concepts": `
### LoRA: parameter-efficient fine-tuning

~~~
Full fine-tuning updates ALL of a model's (potentially
billions of) parameters -- extremely expensive in compute,
memory, and storage (a full copy of the fine-tuned model's
weights). LoRA instead FREEZES the original pretrained
weights entirely, and injects small, trainable "low-rank"
matrices alongside specific layers -- during fine-tuning,
ONLY these small additional matrices are updated, dramatically
reducing the number of trainable parameters (often by 10,000x
or more) while still achieving comparable task-specific
adaptation quality to full fine-tuning for many tasks.
~~~

### RLHF's three-stage process

~~~
1. Supervised Fine-Tuning (SFT): first fine-tune the
   pretrained model on a dataset of high-quality
   demonstration examples (human-written ideal responses).
2. Reward Model training: train a SEPARATE model to predict
   HUMAN PREFERENCE between two candidate model outputs for
   the same prompt (based on human comparison/ranking data).
3. Reinforcement Learning: further fine-tune the SFT model
   using reinforcement learning, with the REWARD MODEL's
   score serving as the reward signal -- directly optimizing
   the model's outputs to score highly according to the
   learned human-preference reward model.
~~~

### Catastrophic forgetting: a genuine, unavoidable risk

~~~
If a model is fine-tuned too aggressively (too many epochs,
too high a learning rate, or on too narrow a dataset) on a
new, specific task, it can lose some of its original,
GENERAL capabilities -- a phenomenon called catastrophic
forgetting, directly connecting to the Machine Learning
skill's own overfitting concerns, but specifically in the
context of a PREVIOUSLY-CAPABLE model losing capabilities
it once had, rather than a model simply never having
learned them in the first place.
~~~

### Direct Preference Optimization (DPO): a simpler RLHF alternative

~~~
DPO directly optimizes a model on human PREFERENCE data
(pairs of "preferred" and "rejected" responses) using a
SINGLE, more stable training objective -- mathematically
reformulated to achieve a similar alignment effect to
traditional RLHF's separate reward-model-plus-reinforcement-
learning pipeline, but WITHOUT needing to train and maintain
a separate reward model or use the more complex, sometimes
less stable reinforcement learning training procedure.
~~~
`,

  "advanced-concepts": `
### QLoRA: combining LoRA with quantization for even greater efficiency

~~~
QLoRA combines LoRA's parameter-efficient adaptation approach
with QUANTIZATION (directly connecting to the Vector Search
skill's own treatment of this compression concept, here
applied to the pretrained model's FROZEN weights rather than
embedding vectors) -- representing the frozen base model's
weights in a lower-precision format during fine-tuning,
dramatically reducing the MEMORY required, letting even very
large models be fine-tuned on comparatively modest,
widely-available consumer/prosumer GPU hardware.
~~~

### Choosing which layers to fine-tune, and LoRA's rank parameter

~~~
LoRA's "rank" parameter (r) directly controls how many
additional trainable parameters are introduced -- a higher
rank provides more adaptation capacity (potentially better
task performance) at the cost of more trainable parameters
(closer to, though still far less than, full fine-tuning's
cost); choosing an appropriate rank is a genuine, deliberate
tradeoff directly connecting to the Machine Learning skill's
own bias-variance treatment -- too low a rank may
underfit the target task, while an unnecessarily high rank
provides diminishing returns for meaningfully increased cost.
~~~

### Data quality and quantity requirements for effective fine-tuning

~~~
Fine-tuning's effectiveness depends critically on training
data QUALITY and REPRESENTATIVENESS -- directly reusing the
Machine Learning skill's own "garbage in, garbage out"
principle; a small, high-quality, carefully-curated dataset
often produces BETTER fine-tuning results than a larger,
noisier, less carefully-curated one, since the model is
directly, permanently learning from whatever patterns are
actually present in the training data, including any
inconsistencies or errors.
~~~

### Mitigating catastrophic forgetting

~~~
Practical mitigations include: using a LOWER learning rate
during fine-tuning (making smaller, more conservative updates
to the pretrained weights); fine-tuning for FEWER epochs
(reducing how much the model's weights drift from their
original, pretrained values); and, where using LoRA
specifically, the FROZEN original weights themselves are
never directly modified at all, providing a genuine,
structural safeguard against forgetting compared to full
fine-tuning, since the original capabilities remain fully
intact in the frozen base weights, with only the small
additional LoRA matrices being learned.
~~~
`,

  "internal-working": `
Tracing the RLHF pipeline's three stages concretely, illustrating how human preference data ultimately shapes the final model's behavior:

~~~mermaid
sequenceDiagram
    participant Pretrained as Pretrained Base Model
    participant SFT as SFT-Tuned Model
    participant RewardModel as Reward Model
    participant RLTraining as RL Fine-Tuning
    participant FinalModel as Final Aligned Model

    Pretrained->>SFT: fine-tune on high-quality\nhuman demonstration examples
    SFT->>SFT: generates candidate responses\nfor various prompts
    Note over RewardModel: Human labelers RANK/COMPARE\nmultiple candidate responses\nfor the same prompt
    SFT->>RewardModel: train reward model to\npredict human preference\nscores from this ranking data
    SFT->>RLTraining: starting point for\nreinforcement learning
    RewardModel->>RLTraining: provides the REWARD\nsignal (how "good," per\nhuman preference, is a\ngiven generated response)
    RLTraining->>FinalModel: model's outputs\noptimized to score\nhighly on the learned\nreward model
~~~

1. **The pretrained base model is first fine-tuned via standard SFT** on a set of high-quality, human-written demonstration examples, providing a genuinely helpful starting point.
2. **Human labelers compare and rank multiple candidate responses** the SFT model generates for various prompts, and this comparison data trains a SEPARATE reward model to predict human preference scores.
3. **The SFT model is then further fine-tuned via reinforcement learning**, using the reward model's score as the reward signal — directly optimizing the model's actual generation behavior to produce outputs the reward model (and, by extension, the human preferences it was trained to predict) scores highly.

**Why this matters**: this concrete trace shows precisely why RLHF is a genuinely DIFFERENT training signal than standard SFT — rather than simply imitating a fixed set of "correct" example outputs, the model is directly optimized toward whatever HUMANS actually judge to be preferable, a training signal capturing nuanced preferences (helpfulness, honesty, tone) that would be genuinely difficult to specify as a fixed, static SFT training set alone.
`,

  architecture: `
A senior AI engineer thinks about fine-tuning architecture in terms of rigorously deciding whether fine-tuning is genuinely necessary over prompting, choosing between full fine-tuning and parameter-efficient techniques (LoRA/QLoRA) based on resource constraints, and designing training data with genuine care for quality and representativeness.

### Deciding whether fine-tuning is genuinely necessary

~~~mermaid
flowchart TB
    Task["A given task"] --> Q1{"Has prompt engineering\n(few-shot, chain-of-thought)\nbeen genuinely, thoroughly\nexhausted first?"}
    Q1 -->|No| TryPrompting["Exhaust prompt\nengineering approaches\nfirst (cheaper, faster\nto iterate)"]
    Q1 -->|"Yes, and still\ninsufficient"| Q2{"Does the task need\nconsistent behavior across\nmassive production volume,\nor deep domain knowledge\nnot in the base model?"}
    Q2 -->|Yes| FineTune["Fine-tuning is\ngenuinely justified"]
~~~

### Choosing full fine-tuning versus LoRA/QLoRA

~~~mermaid
flowchart LR
    Resources["Available compute/\nmemory resources"] --> Q{"Genuinely abundant\ncompute, and maximum\npossible adaptation\nquality needed?"}
    Q -->|Yes| FullFT["Full fine-tuning\n(rare, most expensive)"]
    Q -->|"No -- resource-\nconstrained, or LoRA's\nquality proves sufficient\n(the common case)"| LoRA["LoRA or QLoRA\n(the modern default\nfor most fine-tuning)"]
~~~

### Designing training data with genuine care

A senior practitioner treats fine-tuning training data with the same rigor as any other ML training data (directly reusing the **Machine Learning** skill's own data-quality guidance) — prioritizing quality and genuine representativeness over raw quantity, and explicitly testing for catastrophic forgetting after fine-tuning.
`,

  "data-flow": `
Tracing a LoRA fine-tuning workflow, from a pretrained model through training to a deployed, adapted model:

~~~mermaid
sequenceDiagram
    participant Pretrained as Pretrained Model\n(frozen weights)
    participant LoRAMatrices as LoRA Matrices\n(small, trainable)
    participant TrainingData as Task-Specific\nTraining Data
    participant Deployed as Deployed Model

    TrainingData->>LoRAMatrices: train ONLY the small\nLoRA matrices via\ngradient descent\n(frozen weights unchanged)
    Pretrained->>Deployed: frozen base weights\n(unchanged, reused directly)
    LoRAMatrices->>Deployed: trained LoRA matrices\ncombined with frozen\nbase weights at inference
~~~

The critical detail: the original pretrained model's weights are NEVER modified at all during LoRA fine-tuning — only the small, additional LoRA matrices are trained and stored, meaning the SAME frozen base model can be combined with many DIFFERENT LoRA adaptations for different tasks, without needing to store a full, separate copy of the entire model for each task — a genuinely significant storage and deployment efficiency benefit.
`,

  "production-usage": `
### A representative LoRA fine-tuning configuration (conceptual)

~~~python
from peft import LoraConfig, get_peft_model

lora_config = LoraConfig(
    r=16,               # rank: controls adaptation capacity
    lora_alpha=32,      # scaling factor
    target_modules=["q_proj", "v_proj"],  # which layers to adapt
    lora_dropout=0.05,
)
model = get_peft_model(pretrained_model, lora_config)
train(model, task_specific_dataset, learning_rate=1e-4, epochs=3)
~~~

### Non-negotiables for production fine-tuning

1. **Exhaust prompt engineering approaches first**, only fine-tuning once genuinely necessary, directly reusing the **Prompt Engineering** skill's own escalation guidance.
2. **Prioritize training data quality and representativeness** over raw quantity.
3. **Use LoRA or QLoRA as the default modern approach**, reserving full fine-tuning for genuinely resource-abundant, maximum-quality-required scenarios.
4. **Test explicitly for catastrophic forgetting** after fine-tuning, verifying the model retains genuinely important general capabilities.
5. **Use a conservative learning rate and limited epoch count**, directly mitigating catastrophic forgetting risk.

### Common production patterns

- **LoRA/QLoRA as the dominant modern fine-tuning approach**, given its dramatically reduced cost and storage footprint compared to full fine-tuning.
- **RLHF or DPO for alignment-focused fine-tuning**, specifically training a model's behavior toward genuine human preferences.
- **Multiple LoRA adapters for different tasks**, sharing the same frozen base model, directly enabling efficient multi-task deployment.
`,

  "industry-examples": `
- **InstructGPT and ChatGPT (OpenAI)**: landmark demonstrations of RLHF's dramatic effect on transforming a raw pretrained model into a genuinely helpful, aligned assistant.
- **Hugging Face's PEFT (Parameter-Efficient Fine-Tuning) library**: a widely-used, foundational open-source library implementing LoRA, QLoRA, and related techniques.
- **Llama 2/3's RLHF-based alignment process**: publicly documented, detailed accounts of applying RLHF-style fine-tuning to an openly-released model family.
- **Domain-specific fine-tuned models** (legal, medical, code-specific models): widely used across industry for specialized applications where domain-specific fluency genuinely matters.
`,

  "best-practices": `
1. **Exhaust prompt engineering approaches before fine-tuning**, only escalating when genuinely necessary.
2. **Prioritize training data quality and representativeness over raw quantity.**
3. **Use LoRA or QLoRA as the default, modern parameter-efficient approach**, reserving full fine-tuning for genuinely resource-abundant scenarios.
4. **Use a conservative learning rate and limited epoch count**, directly mitigating catastrophic forgetting.
5. **Test explicitly for catastrophic forgetting**, verifying retained general capability after fine-tuning.
6. **Consider RLHF or DPO specifically for alignment-focused objectives** (helpfulness, honesty, safety), not just task-specific SFT.
7. **Maintain multiple LoRA adapters for different tasks** sharing one frozen base model, where practical, for efficient multi-task deployment.
8. **Version-control and rigorously evaluate fine-tuned model checkpoints**, directly connecting to the platform's later Evaluation and MLOps practices.
`,

  "anti-patterns": `
### Fine-tuning when prompt engineering would genuinely suffice

~~~
# WRONG — jumping straight to an expensive, time-consuming
# fine-tuning process without first genuinely, thoroughly
# exhausting few-shot and chain-of-thought prompting
# approaches (covered in the Prompt Engineering skill)
# RIGHT — always exhaust prompting approaches first; fine-tune
# only once genuinely necessary
~~~

### Using an insufficient or unrepresentative training dataset

~~~
# WRONG — fine-tuning on a small, narrow, or biased dataset
# that doesn't genuinely represent the actual diversity of
# production inputs, producing a model that performs poorly
# on real-world use despite good performance on the (unrepresentative)
# training data
# RIGHT — prioritize training data quality and genuine
# representativeness, directly reusing the Machine Learning
# skill's own data-quality guidance
~~~

### Fine-tuning too aggressively, causing catastrophic forgetting

~~~
# WRONG — using a high learning rate and many epochs,
# causing the model to lose valuable GENERAL capabilities
# while overfitting to the narrow fine-tuning task
# RIGHT — use a conservative learning rate, limited epochs,
# and explicitly test for retained general capability
~~~

### Other production-grade anti-patterns

- **Defaulting to full fine-tuning** when LoRA/QLoRA would achieve comparable quality at dramatically lower cost.
- **Not evaluating a fine-tuned model rigorously** against both the target task AND general capability benchmarks.
- **Confusing SFT and RLHF's genuinely different purposes**, using SFT alone when genuine preference-based alignment is actually needed.
`,

  performance: `
### Rule zero: LoRA's parameter efficiency is almost always the right default starting point for modern fine-tuning

Training only a small number of additional parameters (often 10,000x fewer than full fine-tuning) while achieving comparable task-specific quality for many use cases makes LoRA the sensible default, reserving full fine-tuning for genuinely demanding, resource-abundant scenarios.

### The performance hierarchy (apply in order)

1. **Exhaust prompt engineering first**, the cheapest, fastest-to-iterate approach.
2. **Use LoRA or QLoRA** as the default fine-tuning approach, dramatically reducing compute/memory/storage cost.
3. **Use a conservative learning rate and limited epochs**, both for training efficiency and catastrophic-forgetting mitigation.
4. **Consider DPO over full RLHF** for alignment objectives, given its simpler, more stable training process while achieving comparable results.
5. **Profile actual fine-tuning compute/time cost** against the genuine business value of the improvement, verifying the investment is justified.

### Micro-level facts worth knowing

- QLoRA's combination of quantization and LoRA can let even very large models be fine-tuned on a single, comparatively modest consumer/prosumer GPU, dramatically lowering the practical barrier to entry.
- LoRA's rank parameter directly trades adaptation capacity against trainable parameter count — higher rank provides more capacity at proportionally higher (though still far below full fine-tuning) cost.
- RLHF's three-stage pipeline (SFT, reward model training, RL fine-tuning) is genuinely more complex and resource-intensive than DPO's single-stage, direct preference optimization approach, a real, practical consideration when choosing an alignment technique.
`,

  scalability: `
Parameter-efficient fine-tuning techniques (LoRA, QLoRA) directly enable fine-tuning to scale practically to organizations and individuals without massive compute budgets, dramatically broadening who can practically fine-tune large models.

### How parameter-efficient fine-tuning enables broader access

~~~mermaid
flowchart LR
    FullFineTuning["Full fine-tuning:\nrequires enormous\ncompute/memory"] --> LimitedAccess["Practically accessible\nonly to well-resourced\norganizations"]
    LoRAQLoRA["LoRA/QLoRA:\ntrains a tiny fraction\nof parameters"] --> BroaderAccess["Practically accessible on\nmodest, widely-available\nhardware"]
~~~

### Known ceilings and answers

| Bottleneck | Answer |
|------------|--------|
| Full fine-tuning's compute/memory cost prohibitive for most organizations | Use LoRA or QLoRA instead |
| Managing many task-specific fine-tuned model variants | Use multiple LoRA adapters sharing one frozen base model |
| Catastrophic forgetting risk when fine-tuning aggressively | Use a conservative learning rate, limited epochs, and explicit general-capability testing |
| RLHF's complex, resource-intensive multi-stage pipeline | Consider DPO as a simpler, more stable alternative achieving comparable alignment results |
`,

  security: `
### Fine-tuning-specific security and safety considerations

~~~
Fine-tuning on genuinely sensitive or proprietary data raises
real data-privacy and intellectual-property considerations --
a fine-tuned model can sometimes memorize and potentially
regurgitate specific training examples, directly connecting
to the broader deep learning privacy/memorization concerns
covered in the Deep Learning and Embeddings skills.
~~~

### Essential fine-tuning-related security practices

1. **Carefully curate and audit fine-tuning training data** for genuinely sensitive information that shouldn't be memorized or potentially regurgitated by the resulting model.
2. **Consider the specific risk of fine-tuning degrading a model's existing safety alignment** (a genuine, documented concern with some fine-tuning approaches), testing explicitly for this after fine-tuning.
3. **Validate and sanitize any user-provided content used in fine-tuning data pipelines**, directly reusing general input-validation guidance from the **OWASP Top 10** skill.

See the **Deep Learning**, **Embeddings**, and **OWASP Top 10** skills for the broader security context this connects to, and the platform's later **AI Red Teaming** skill for adversarial testing of fine-tuned models specifically.
`,

  testing: `
### Testing for catastrophic forgetting

~~~python
def test_fine_tuned_model_retains_general_capability():
    general_benchmark_score_before = evaluate(base_model, general_benchmark)
    general_benchmark_score_after = evaluate(fine_tuned_model, general_benchmark)
    assert general_benchmark_score_after >= general_benchmark_score_before - ACCEPTABLE_DEGRADATION
~~~

### Testing task-specific fine-tuning improvement

~~~python
def test_fine_tuned_model_improves_target_task():
    base_score = evaluate(base_model, target_task_benchmark)
    fine_tuned_score = evaluate(fine_tuned_model, target_task_benchmark)
    assert fine_tuned_score > base_score  # meaningful improvement
~~~

### The senior testing doctrine

- Test both target-task improvement AND general-capability retention explicitly, never assuming one without measuring the other.
- Test on a genuinely held-out, representative evaluation set, distinct from the fine-tuning training data itself, directly reusing the **Machine Learning** skill's own train/test split discipline.
- Test for alignment/safety regressions explicitly if fine-tuning an already-aligned model, verifying safety behavior is preserved.
- Compare LoRA/QLoRA results against a full fine-tuning baseline (where feasible) to validate the parameter-efficient approach's quality is genuinely comparable for your specific task.
`,

  debugging: `
### The toolbox, in escalation order

1. **Check whether prompt engineering was genuinely, thoroughly exhausted first**, if a team jumped directly to fine-tuning without this escalation.
2. **Check training data quality and representativeness** if a fine-tuned model performs poorly on real-world production input despite good training-set performance.
3. **Check for catastrophic forgetting** if a fine-tuned model has lost previously-reliable general capabilities.
4. **Check learning rate and epoch count** if catastrophic forgetting is confirmed, considering more conservative settings.

### Debugging common fine-tuning-related symptoms

- "The fine-tuned model performs worse on general tasks than the base model" — likely catastrophic forgetting; reduce learning rate/epochs, or consider LoRA if using full fine-tuning.
- "The fine-tuned model doesn't reliably improve on the target task" — check training data quality, quantity, and representativeness.
- "Fine-tuning seems unnecessarily expensive/slow" — consider LoRA or QLoRA instead of full fine-tuning.
- "The fine-tuned model's safety/alignment behavior has degraded" — test explicitly for this regression, and consider a more conservative fine-tuning approach preserving the base model's existing alignment.
`,

  monitoring: `
### Key signals to track

- **Target-task performance metrics** (directly connecting to the platform's later **Evaluation** skill), tracked before and after fine-tuning.
- **General-capability benchmark scores**, watching for catastrophic forgetting regressions.
- **Training loss curves during fine-tuning**, directly reusing the **Deep Learning** skill's own training-monitoring guidance.
- **Fine-tuning compute cost and time**, particularly relevant for comparing full fine-tuning against LoRA/QLoRA's efficiency benefit.

### Tools

Standard experiment tracking (covered in the platform's MLOps category) for logging fine-tuning runs, hyperparameters, and evaluation results; Hugging Face's PEFT library and similar tooling for LoRA/QLoRA implementation; RLHF/DPO-specific frameworks (TRL, and others) for alignment-focused fine-tuning.

### Alerting priorities

Alert on general-capability benchmark scores dropping significantly after a fine-tuning run (a leading indicator of catastrophic forgetting), and on target-task performance failing to improve meaningfully despite the fine-tuning investment.
`,

  deployment: `
### A representative LoRA adapter deployment pattern

~~~python
from peft import PeftModel

base_model = load_pretrained_model("base-model-name")
model = PeftModel.from_pretrained(base_model, "task-specific-lora-adapter")
# The SAME base_model can load a DIFFERENT LoRA adapter for a different task
~~~

### CI/CD pipeline considerations

Treat fine-tuned model checkpoints (or LoRA adapter weights) as genuine, versioned artifacts, with automated evaluation against both target-task and general-capability benchmarks as a deployment gate before a new fine-tuned version replaces the current production model. See the platform's MLOps category for the general deployment depth this connects to.
`,

  "production-checklist": `
Before a production fine-tuned model takes real traffic:

- [ ] Prompt engineering approaches genuinely, thoroughly exhausted first, with fine-tuning justified as genuinely necessary
- [ ] Training data quality and representativeness explicitly reviewed
- [ ] LoRA or QLoRA used by default, with full fine-tuning reserved for genuinely resource-abundant, maximum-quality-required cases
- [ ] Learning rate and epoch count set conservatively, directly mitigating catastrophic forgetting risk
- [ ] Both target-task improvement AND general-capability retention explicitly evaluated
- [ ] Alignment/safety behavior explicitly tested for regression if fine-tuning an already-aligned model
- [ ] Fine-tuned model checkpoints/adapters version-controlled and reproducible
`,

  "common-mistakes": `
1. **Fine-tuning when prompt engineering would genuinely suffice**, incurring unnecessary cost and complexity.
2. **Using an insufficient or unrepresentative training dataset**, producing a model that performs poorly on real-world production input.
3. **Fine-tuning too aggressively** (high learning rate, many epochs), causing catastrophic forgetting.
4. **Defaulting to full fine-tuning** when LoRA/QLoRA would achieve comparable quality at dramatically lower cost.
5. **Not evaluating both target-task and general-capability performance**, missing catastrophic forgetting regressions.
6. **Confusing SFT and RLHF's genuinely different purposes**, using the wrong technique for the actual objective (task adaptation versus preference alignment).
`,

  "common-errors": `
| Error | Typical Cause | Fix |
|-------|---------------|-----|
| Fine-tuned model performs worse on general tasks | Catastrophic forgetting from overly aggressive fine-tuning | Reduce learning rate/epochs, or switch to LoRA |
| Fine-tuned model doesn't improve on the target task | Insufficient or unrepresentative training data | Improve training data quality and genuine representativeness |
| Fine-tuning is prohibitively expensive/slow | Full fine-tuning used unnecessarily | Switch to LoRA or QLoRA |
| Fine-tuned model's safety behavior has degraded | Fine-tuning process didn't account for preserving existing alignment | Test explicitly for this regression; use a more conservative approach |
| RLHF pipeline is unstable or difficult to implement | Traditional RLHF's multi-stage complexity | Consider DPO as a simpler, more stable alternative |
| Fine-tuned model appears to have memorized sensitive training examples | Insufficiently curated/audited training data | Audit training data for sensitive content before fine-tuning |
`,

  faqs: `
**When should I fine-tune instead of using prompt engineering?**
Only after genuinely, thoroughly exhausting prompt engineering approaches (few-shot, chain-of-thought) — fine-tuning is justified specifically when the task needs highly consistent behavior at massive production scale, deep domain-specific knowledge poorly represented in general training data, or exceeds what can practically fit within context window constraints.

**What is LoRA, and why is it the modern default fine-tuning approach?**
Low-Rank Adaptation freezes a model's original pretrained weights and trains only a small number of additional, low-rank parameters — dramatically reducing compute, memory, and storage cost (often by 10,000x fewer trainable parameters) compared to full fine-tuning, while achieving comparable task-specific quality for many use cases.

**What's the difference between SFT and RLHF?**
SFT trains a model to imitate a fixed set of demonstration examples; RLHF trains a model using a learned reward model reflecting actual human preference comparisons between candidate outputs — a genuinely different, richer training signal specifically suited to aligning a model's behavior with nuanced human judgment (helpfulness, honesty, tone) rather than simply matching a fixed dataset.

**What is catastrophic forgetting?**
When a model, fine-tuned too aggressively on a narrow task, loses some of its original, general capabilities — a genuine, unavoidable risk mitigated via conservative learning rates, limited epochs, and (with LoRA specifically) the structural safeguard of never modifying the original frozen weights at all.

**What is QLoRA?**
A technique combining LoRA's parameter-efficient adaptation with quantization of the frozen base model's weights, dramatically reducing the memory required for fine-tuning and letting even very large models be fine-tuned on comparatively modest, widely-available hardware.

**What is DPO, and how does it relate to RLHF?**
Direct Preference Optimization directly optimizes a model on human preference data using a single, simpler, more stable training objective, achieving alignment benefits comparable to traditional RLHF's more complex three-stage (SFT, reward model, reinforcement learning) pipeline, without needing to train and maintain a separate reward model.
`,

  "interview-questions": `
### Junior level

1. **What is fine-tuning?**
   Model answer: further training a pretrained model on a smaller, task-specific dataset, directly updating its weights to adapt its behavior.

2. **What is LoRA?**
   Model answer: a parameter-efficient fine-tuning technique that freezes the original model weights and trains only a small number of additional, low-rank parameters, dramatically reducing cost.

3. **What is RLHF?**
   Model answer: Reinforcement Learning from Human Feedback, a technique training a model's behavior to match human preferences, using a learned reward model reflecting human comparisons between candidate outputs.

4. **What is catastrophic forgetting?**
   Model answer: when a model, fine-tuned too aggressively on a narrow task, loses some of its original, general capabilities.

### Senior level

5. **Explain precisely why RLHF represents a genuinely different, richer training signal than standard Supervised Fine-Tuning, and why this difference specifically matters for alignment.**
   Model answer: SFT trains a model to imitate a FIXED set of demonstration examples — the model learns to reproduce patterns present in whatever specific examples were included in the training set, but this requires someone to have already WRITTEN a genuinely correct, ideal example for every situation the model might encounter, which becomes impractical for capturing nuanced, context-dependent qualities like "helpfulness," "honesty," or "appropriate tone" across the enormous diversity of real-world prompts; RLHF instead trains a REWARD MODEL to predict human PREFERENCE between pairs of candidate outputs (which of two responses do human reviewers actually prefer, and why), then uses this learned reward signal to further fine-tune the model via reinforcement learning — this lets the training signal capture nuanced, comparative human judgment ("this response is better because...") rather than requiring a single, fixed "correct" answer to be pre-specified for every possible prompt; this richer signal is precisely why RLHF (or its simpler alternative, DPO) has proven essential for achieving genuine alignment — SFT alone, however extensive, tends to produce a model that mimics demonstration patterns without the FLEXIBLE, generalizable sense of "what humans actually prefer" that RLHF's comparative reward signal more directly targets.

6. **A team decides to fine-tune a large language model on their company's internal documentation to build an internal Q&A assistant, using full fine-tuning with a learning rate and epoch count copied from a tutorial for a different task. After training, the model answers internal questions reasonably well but has noticeably degraded at general reasoning and conversation compared to the base model. Diagnose and propose a fix.**
   Model answer: this is a clear, classic case of CATASTROPHIC FORGETTING — the model has adapted (perhaps successfully) to the narrow internal-documentation task, but at the cost of losing some of its original, general capabilities, likely because the learning rate/epoch count (copied from an unrelated tutorial, not tuned for this specific situation) was too aggressive relative to this team's actual training data size and desired behavior preservation; the fix involves several complementary steps: first, switch to LoRA (or QLoRA) rather than full fine-tuning if not already using it, since LoRA's frozen base weights provide a structural safeguard against forgetting (the original capabilities remain fully intact in the untouched frozen weights); second, reduce the learning rate and/or number of training epochs, making smaller, more conservative updates; third, explicitly evaluate BOTH the target task (internal Q&A quality) AND general-capability benchmarks before and after any further fine-tuning attempt, rather than only checking the target task in isolation — this evaluation discipline (directly connecting to the **Machine Learning** skill's own rigorous evaluation guidance) would have caught this regression before deployment, and should be a standard, non-negotiable part of the team's fine-tuning workflow going forward.

7. **Explain LoRA's mechanism precisely: what specifically is frozen, what specifically is trained, and why does this achieve comparable quality to full fine-tuning for many tasks despite training far fewer parameters?**
   Model answer: LoRA freezes the ENTIRE original pretrained model's weight matrices, never updating them during fine-tuning at all; instead, for specific target layers (commonly the attention mechanism's query and value projection matrices, though this is configurable), LoRA injects a pair of small, trainable "low-rank" matrices whose PRODUCT approximates a low-rank update to that layer's effective behavior — during fine-tuning, ONLY these small additional matrices are updated via gradient descent, while the original frozen weights remain completely unchanged; this works because task-specific ADAPTATION (as opposed to learning entirely new, general capabilities from scratch) often has a genuinely LOW "intrinsic rank" — the actual, meaningful change needed to adapt a model's behavior for a specific narrower task can often be well-approximated by a comparatively low-rank transformation, even though the model's full weight matrices are extremely high-dimensional; this is precisely why training only these small, low-rank matrices (a tiny fraction of the full model's total parameter count) can still achieve comparable task-specific adaptation quality to full fine-tuning for many practical use cases — the hypothesis being tested and validated empirically is that most of the "work" needed for typical task adaptation doesn't actually require the full expressive power of updating every single one of the model's billions of parameters.

8. **Compare traditional RLHF and DPO, explaining specifically what complexity DPO eliminates and what (if anything) is potentially traded away in exchange.**
   Model answer: traditional RLHF requires THREE distinct stages — SFT on demonstration data, training a SEPARATE reward model on human preference-comparison data, and then a genuinely separate reinforcement learning fine-tuning stage using that reward model's score as the reward signal (a comparatively complex, sometimes unstable training process, since reinforcement learning training can be more finicky to get right than standard supervised training); DPO mathematically reformulates this same underlying objective (optimizing a model toward human preference data) into a SINGLE, more standard, differentiable training objective directly operating on preference pairs (a "preferred" and a "rejected" response for the same prompt), eliminating the need to train and maintain a SEPARATE reward model entirely, and eliminating the reinforcement learning training stage's specific complexity/instability concerns; what's potentially traded away is some of RLHF's theoretical flexibility — a genuinely separate, explicit reward model can, in principle, be reused or inspected independently of the policy-optimization process, and some practitioners have found RLHF's more flexible framework allows for certain more sophisticated reward-shaping techniques that DPO's more direct, single-objective formulation doesn't as naturally accommodate; in practice, DPO has been empirically shown to achieve comparable alignment quality to RLHF for many use cases, making it an increasingly popular, simpler default choice, though RLHF's more flexible framework remains relevant for specific, more sophisticated alignment research and applications.

9. **Design a fine-tuning strategy for adapting a large language model to write in a specific company's brand voice/style for marketing content, given a moderate-sized dataset of approximately 500 example marketing pieces.**
   Model answer: first, seriously consider whether few-shot PROMPTING (providing several example marketing pieces directly in the prompt, directly reusing the **Prompt Engineering** skill's guidance) might genuinely suffice for this specific, comparatively narrow stylistic-adaptation task, since 500 examples is a genuinely modest dataset size, and style/tone adaptation is often achievable via careful few-shot prompting alone without the added cost and complexity of fine-tuning; if fine-tuning is still judged genuinely necessary (perhaps because the application needs this style applied automatically and consistently across an extremely high volume of content generation, where few-shot prompting's added context-window cost per request becomes a significant practical concern at that scale), use LoRA (not full fine-tuning) given this comparatively modest 500-example dataset size, which is well-suited to LoRA's parameter-efficient approach; use a conservative learning rate and a modest number of epochs specifically because catastrophic forgetting risk is genuinely relevant here — over-fitting to just 500 stylistic examples risks the model losing broader language capability while narrowly optimizing for this specific style; explicitly evaluate BOTH the target style-adherence quality AND general language capability retention after fine-tuning, and consider augmenting the 500 genuine examples with careful, deliberate data augmentation techniques (if genuinely representative additional examples can be reasonably synthesized) to provide the fine-tuning process with somewhat more diverse training signal within this comparatively narrow, specific stylistic domain.

10. **How would you decide whether a fine-tuning project's actual investment (data collection, compute, engineering time) is justified for a specific business use case?**
    Model answer: first, rigorously confirm that prompt engineering approaches have been genuinely, thoroughly exhausted and are demonstrably insufficient for the actual business requirement — this should be an evidence-based conclusion (documented prompting attempts and their measured shortfalls), not an assumption; second, quantify the SPECIFIC business value the improved reliability/consistency/domain-knowledge fine-tuning would provide — for instance, if a prompting-based approach achieves 85% accuracy on a critical task and fine-tuning could realistically achieve 95%, quantify what that 10 percentage-point improvement is genuinely worth in the actual business context (reduced error-handling cost, improved customer satisfaction, reduced risk exposure, and similar concrete business metrics); third, estimate the ACTUAL fine-tuning cost realistically — including not just compute cost (which LoRA/QLoRA can make comparatively modest) but also the genuine cost of collecting/curating a sufficiently large, representative, high-quality training dataset (often the more expensive and time-consuming component in practice) and the ongoing engineering cost of maintaining, evaluating, and periodically re-fine-tuning the model as requirements or the underlying base model evolve over time; only proceed with fine-tuning when this quantified expected business value genuinely, clearly exceeds this realistic total cost estimate — a disciplined, business-value-driven framework rather than defaulting to fine-tuning simply because it's technically available or because prompting alone feels intuitively insufficient without rigorous validation of that intuition.
`,

  "coding-questions": `
### 1. Implement a simplified LoRA layer from scratch

~~~python
import numpy as np

class SimplifiedLoRALayer:
    def __init__(self, original_weight, rank=8, alpha=16):
        self.original_weight = original_weight  # FROZEN, never updated
        d_in, d_out = original_weight.shape
        self.A = np.random.randn(d_in, rank) * 0.01  # trainable
        self.B = np.zeros((rank, d_out))              # trainable, init to zero
        self.scaling = alpha / rank

    def forward(self, x):
        original_output = x @ self.original_weight
        lora_output = (x @ self.A @ self.B) * self.scaling
        return original_output + lora_output
# Follow-up: why is B initialized to all zeros, ensuring the
# LoRA layer initially contributes NOTHING (the layer behaves
# identically to the original, unmodified weight) at the very
# start of fine-tuning?
~~~

### 2. Implement a simple preference-comparison-based training signal (conceptual DPO-style)

~~~python
def dpo_loss(policy_logprobs_preferred, policy_logprobs_rejected,
             reference_logprobs_preferred, reference_logprobs_rejected, beta=0.1):
    policy_ratio = policy_logprobs_preferred - policy_logprobs_rejected
    reference_ratio = reference_logprobs_preferred - reference_logprobs_rejected
    logits = beta * (policy_ratio - reference_ratio)
    loss = -np.log(sigmoid(logits))
    return loss
# Follow-up: why does this loss function compare the CURRENT
# policy model's preference ratio against a FIXED reference
# model's preference ratio, rather than just using the policy
# model's own preference ratio alone?
~~~

### 3. Implement a simple catastrophic forgetting detector

~~~python
def detect_catastrophic_forgetting(base_model, fine_tuned_model,
                                     general_benchmark, threshold=0.05):
    base_score = evaluate(base_model, general_benchmark)
    fine_tuned_score = evaluate(fine_tuned_model, general_benchmark)
    degradation = base_score - fine_tuned_score
    return degradation > threshold, degradation
# Follow-up: why is it important to evaluate on a GENERAL
# benchmark (unrelated to the fine-tuning task) rather than
# only the fine-tuning task's own held-out test set, to
# genuinely detect catastrophic forgetting?
~~~
`,

  "hands-on-labs": `
### Lab 1 (Beginner): Fine-tune a small model using SFT on a simple task
Using a small, open-source pretrained model, perform basic Supervised Fine-Tuning on a small, labeled dataset for a simple classification or generation task. Deliverable: a working, evaluated fine-tuned model. Skills exercised: basic SFT workflow.

### Lab 2 (Intermediate): Implement and compare LoRA against full fine-tuning
Fine-tune the same model on the same task using both LoRA and full fine-tuning, comparing training time, resource usage, and resulting task performance. Deliverable: a documented comparison. Skills exercised: parameter-efficient fine-tuning evaluation.

### Lab 3 (Advanced): Detect and mitigate catastrophic forgetting
Deliberately over-fine-tune a model (aggressive learning rate, many epochs) on a narrow task, measure the resulting degradation on a general capability benchmark, then apply mitigation (lower learning rate, fewer epochs, or switching to LoRA) and re-measure. Deliverable: a documented before/after catastrophic forgetting analysis. Skills exercised: applied forgetting mitigation.

### Lab 4 (Production): Implement a simplified DPO training loop
Implement a simplified Direct Preference Optimization training loop using a small preference dataset (pairs of preferred/rejected responses), and qualitatively evaluate the resulting model's alignment with the demonstrated preferences. Deliverable: a working, evaluated DPO implementation. Skills exercised: applied preference-based alignment fine-tuning.
`,

  "real-projects": `
### 1. A domain-specific Q&A assistant fine-tuned on internal documentation
Engineering requirements: LoRA-based fine-tuning on curated internal documentation, with explicit evaluation for both target-task quality and general-capability retention.

### 2. A multi-task LoRA adapter library sharing one frozen base model
Engineering requirements: multiple independently-trained LoRA adapters for distinct tasks, all sharing a single frozen base model for efficient, low-storage-overhead multi-task deployment.

### 3. A DPO-based alignment fine-tuning pipeline
Engineering requirements: a preference-data collection and DPO training pipeline for aligning a model's outputs with specific, documented organizational preferences (tone, safety constraints, and others).
`,

  "case-studies": `
### InstructGPT's demonstration that alignment matters more than raw scale for helpfulness
OpenAI's InstructGPT paper demonstrated that a comparatively small (1.3B parameter) RLHF-fine-tuned model was preferred by human evaluators over the much larger (175B parameter) raw GPT-3 model for actual helpfulness and instruction-following — a striking, widely-cited finding demonstrating that ALIGNMENT-focused fine-tuning, not just raw model scale, is essential for producing a genuinely useful assistant. Lesson: raw capability (from scale and pretraining alone) and genuine USEFULNESS/alignment are meaningfully different properties — a much smaller, properly-aligned model can be more practically valuable than a much larger, unaligned one for many real-world use cases.

### LoRA's rapid, widespread adoption as the default modern fine-tuning approach
LoRA's dramatic reduction in fine-tuning's compute/memory/storage cost led to remarkably rapid, widespread industry and open-source community adoption, directly enabling a much broader range of individuals and organizations (without access to massive compute budgets) to practically fine-tune large models for their own specific needs. Lesson: a technique that dramatically lowers the cost/resource barrier to an already-valuable capability (fine-tuning) can meaningfully democratize access to that capability, broadening who can practically participate in a previously resource-gated activity.

### The emergence of DPO as a response to RLHF's genuine practical complexity
DPO's development directly responded to practitioners' genuine, widely-reported difficulty in implementing and stabilizing traditional RLHF's multi-stage reinforcement learning pipeline, offering a simpler, more stable alternative achieving comparable alignment results — a genuine simplification that made preference-based alignment fine-tuning meaningfully more accessible to a broader range of practitioners. Lesson: when a powerful but genuinely complex technique (RLHF) sees widespread adoption, subsequent research attention often turns toward simplifying its implementation while preserving its core benefits — complexity reduction, not just raw capability improvement, is itself a genuinely valuable research and engineering contribution.
`,

  comparisons: `
| Aspect | Full Fine-Tuning | LoRA | QLoRA |
|--------|----------------------|----------|-----------|
| Parameters trained | All (potentially billions) | Small additional low-rank matrices only | Same as LoRA, plus quantized base weights |
| Compute/memory cost | Highest | Dramatically lower | Even lower (via quantization) |
| Storage per task variant | Full model copy | Small adapter file only | Small adapter file only |
| Best fit | Maximum quality, abundant resources | Most modern fine-tuning use cases | Resource-constrained hardware |

| Aspect | Supervised Fine-Tuning (SFT) | RLHF | DPO |
|--------|-----------------------------------|----------|---------|
| Training signal | Fixed demonstration examples | Learned reward model from human comparisons | Direct preference pairs, single objective |
| Complexity | Lower | Higher (3-stage pipeline) | Lower (single-stage) |
| Best fit | Task-specific behavior adaptation | Nuanced alignment (helpfulness, honesty) | Alignment, simpler than RLHF |

**How seniors choose**: default to LoRA/QLoRA over full fine-tuning for most modern use cases; use SFT for straightforward task adaptation; use RLHF or (increasingly preferred for its simplicity) DPO specifically for genuine preference-based alignment objectives.
`,

  "related-technologies": `
- **Prompt Engineering** — the cheaper, faster-to-iterate alternative that should be exhausted before fine-tuning.
- **Deep Learning** — the general transfer learning framework this page's fine-tuning techniques are a direct, specific application of.
- **Machine Learning** — the bias-variance/overfitting concepts directly connecting to catastrophic forgetting.
- **Inference**, **Serving** — covered next in this category, addressing how a fine-tuned (or LoRA-adapted) model is actually deployed and served in production.
- **Evaluation** — essential for rigorously validating both target-task improvement and general-capability retention after fine-tuning.

Learning path: **Prompt Engineering** → this page (Fine-Tuning) → **Inference** → **Serving** → the remaining skills in this category.
`,

  "latest-updates": `
Knowledge cutoff for this page: January 2026. As of that cutoff:

- LoRA and QLoRA remain the dominant, standard parameter-efficient fine-tuning approaches, with continued refinement and broader tooling support.
- DPO and related simplified preference-optimization techniques continue gaining adoption as more practitioners favor its reduced implementation complexity over traditional RLHF.
- Continued growth of accessible fine-tuning tooling (Hugging Face's PEFT and TRL libraries, and similar) lowering the practical barrier to entry further.
- Given continued evolution in this space, verify current best-practice fine-tuning technique recommendations against up-to-date research and tooling documentation.
`,

  "future-roadmap": `
Where fine-tuning technology is heading, and what's worth betting career time on:

- **Continued dominance of parameter-efficient techniques (LoRA/QLoRA)** as the default modern fine-tuning approach, over increasingly rare full fine-tuning.
- **Continued growth of simplified alignment techniques (DPO and similar)** as more accessible alternatives to traditional RLHF's complexity.
- **Continued refinement of tooling and best practices** for rigorously evaluating fine-tuned models against both target-task and general-capability benchmarks.
- **What to bet on**: deeply understanding when fine-tuning is genuinely necessary (versus prompting), the mechanics and tradeoffs of parameter-efficient techniques, and the genuine difference between SFT and preference-based alignment — these foundational judgments transfer directly to any current or future fine-tuning technique/tooling, a far more durable investment than familiarity with any single current library's specific API.
`,

  "cheat-sheet": `
~~~
# ---- Fine-tuning vs prompting: the escalation decision ----
Prompting FIRST (cheap, fast iteration) -> fine-tune ONLY
    once genuinely, thoroughly exhausted and still insufficient.
~~~

~~~
# ---- SFT vs RLHF/DPO ----
SFT:  imitate FIXED demonstration examples -- task adaptation
RLHF: learn a reward model from human PREFERENCE comparisons,
      then RL fine-tune against it -- genuine alignment
DPO:  same alignment goal as RLHF, SINGLE simpler objective,
      no separate reward model needed
~~~

~~~
# ---- LoRA: the modern default ----
Freeze ALL original weights. Train only small, added
    low-rank matrices (often 10,000x fewer params).
QLoRA = LoRA + quantized frozen base weights -> fits on
    modest, widely-available hardware.
~~~

~~~
# ---- Catastrophic forgetting ----
Fine-tuning too aggressively (high LR, many epochs) ->
    model loses GENERAL capabilities it once had.
Mitigate: lower learning rate, fewer epochs, use LoRA
    (frozen weights = structural safeguard).
ALWAYS evaluate BOTH target task AND general benchmarks.
~~~

~~~
# ---- Data quality > data quantity ----
A small, high-quality, representative dataset often beats
    a larger, noisier one -- garbage in, garbage out.
~~~
`,

  "flash-cards": `
| Question | Answer |
|----------|--------|
| When should you fine-tune instead of prompt? | Only after prompting is genuinely, thoroughly exhausted. |
| What is LoRA? | Freezes original weights, trains only small added low-rank matrices. |
| What is QLoRA? | LoRA + quantized frozen base weights — fits on modest hardware. |
| SFT vs RLHF? | SFT imitates fixed examples; RLHF optimizes against a learned human-preference reward model. |
| What is DPO? | Simpler alternative to RLHF — single objective, no separate reward model. |
| What is catastrophic forgetting? | Model loses general capabilities from too-aggressive fine-tuning. |
| How to mitigate catastrophic forgetting? | Lower learning rate, fewer epochs, use LoRA, evaluate general benchmarks too. |
| Why does LoRA work despite few trained params? | Task adaptation often has low "intrinsic rank" — small updates suffice. |
| RLHF's three stages? | SFT -> reward model training -> RL fine-tuning against the reward model. |
| Data quality vs quantity for fine-tuning? | Quality/representativeness matters more — garbage in, garbage out. |
`,

  mcqs: `
1. When is fine-tuning genuinely justified over prompt engineering?
   A) Always, as the first approach to try  B) Only after prompt engineering has been genuinely, thoroughly exhausted and proves insufficient  C) Never — prompting always suffices  D) Only for image models
   **Answer: B** — fine-tuning is the more expensive escalation path, not the default first choice.

2. What does LoRA train, and what does it freeze?
   A) Trains everything, freezes nothing  B) Freezes the original pretrained weights, trains only small additional low-rank matrices  C) Freezes everything, trains nothing  D) Trains only the embedding layer
   **Answer: B** — a dramatic reduction in trainable parameters compared to full fine-tuning.

3. What is the key difference between SFT and RLHF?
   A) They are identical  B) SFT imitates fixed demonstration examples; RLHF optimizes against a learned reward model reflecting human preference comparisons  C) RLHF doesn't require any training data  D) SFT is only used for images
   **Answer: B** — a genuinely richer, comparative training signal in RLHF.

4. What is catastrophic forgetting?
   A) A hardware failure during training  B) A model losing some of its original, general capabilities due to overly aggressive fine-tuning on a narrow task  C) A type of data corruption  D) An error in the tokenizer
   **Answer: B** — mitigated via conservative learning rates, limited epochs, and LoRA's structural safeguard.

5. What does DPO simplify compared to traditional RLHF?
   A) It eliminates the need for any human preference data  B) It eliminates the need for a separate reward model and the reinforcement learning training stage, using a single direct objective  C) It makes the model smaller  D) It removes the need for a pretrained base model
   **Answer: B** — achieving comparable alignment results with reduced implementation complexity.
`,

  "revision-notes": `
Fine-tuning is the process of further training a pretrained large language model on a smaller, task-specific dataset, directly updating its weights — a direct, specific application of the **Deep Learning** skill's transfer learning concept, reserved as the more expensive, more powerful escalation path once **Prompt Engineering** (covered in the immediately preceding skill) has been genuinely, thoroughly exhausted and proves insufficient.

SUPERVISED FINE-TUNING (SFT) trains a model to imitate a FIXED set of labeled demonstration examples, directly adapting its behavior toward the patterns present in that training data. LORA (Low-Rank Adaptation, Hu et al., 2021) is the dominant modern PARAMETER-EFFICIENT fine-tuning technique: it FREEZES the entire original pretrained model's weights, and trains only small, additional "low-rank" matrices injected alongside specific target layers — dramatically reducing trainable parameter count (often by 10,000x or more) while achieving comparable task-specific adaptation quality to full fine-tuning for many use cases, since typical task adaptation often has a genuinely low "intrinsic rank," meaning a small, low-rank update can well-approximate the needed behavioral change. QLORA further combines LoRA with QUANTIZATION of the frozen base model's weights (directly connecting to the **Vector Search** skill's own quantization treatment, here applied to model weights rather than embeddings), dramatically reducing memory requirements and letting even very large models be fine-tuned on comparatively modest hardware.

A critical, frequently-tested distinction: RLHF (Reinforcement Learning from Human Feedback) represents a genuinely DIFFERENT, richer training signal than standard SFT — rather than imitating fixed demonstration examples, RLHF's three-stage pipeline (1. SFT on high-quality demonstrations, 2. training a SEPARATE reward model to predict human PREFERENCE comparisons between candidate outputs, 3. further fine-tuning the SFT model via reinforcement learning using this reward model's score as the reward signal) directly optimizes a model's behavior toward whatever humans actually judge to be preferable — capturing nuanced qualities (helpfulness, honesty, appropriate tone) that would be genuinely difficult to specify as a fixed, static SFT training set alone. InstructGPT's landmark finding that a much SMALLER RLHF-fine-tuned model was preferred by human evaluators over a much LARGER raw pretrained model directly demonstrated that alignment-focused fine-tuning, not scale alone, is essential for genuine usefulness.

DPO (Direct Preference Optimization) offers a SIMPLER, more stable alternative to traditional RLHF, directly optimizing on preference pairs (a "preferred" and "rejected" response) using a single, more standard training objective — eliminating the need to train and maintain a separate reward model and avoiding reinforcement learning's specific training-stability challenges, while achieving comparable alignment results for many use cases, an increasingly popular simplification.

A genuinely important, unavoidable risk is CATASTROPHIC FORGETTING: fine-tuning too aggressively (too high a learning rate, too many epochs, or on too narrow a dataset) can cause a model to lose some of its original, general capabilities — directly connecting to the **Machine Learning** skill's own overfitting concerns, but specifically in the context of a previously-capable model losing capabilities it once had. Mitigation includes using a conservative learning rate, limiting training epochs, and — with LoRA specifically — the genuine structural safeguard that the original frozen weights are NEVER modified at all, meaning original capabilities remain fully intact regardless of how the small additional LoRA matrices are trained. A senior practitioner ALWAYS evaluates BOTH target-task improvement AND general-capability retention explicitly after fine-tuning, never assuming one without measuring the other.

Fine-tuning's effectiveness depends critically on training DATA QUALITY and REPRESENTATIVENESS — directly reusing the **Machine Learning** skill's own "garbage in, garbage out" principle; a small, high-quality, carefully-curated dataset often outperforms a larger, noisier one. A senior AI engineer follows a clear, disciplined decision framework: exhaust prompt engineering first, default to LoRA/QLoRA over full fine-tuning for the vast majority of modern use cases, use SFT for straightforward task adaptation, and reach for RLHF or (increasingly preferred for its simplicity) DPO specifically for genuine preference-based alignment objectives — this practical judgment directly underlies the next skills in this category, **Inference** and **Serving**, which address how a fine-tuned (or LoRA-adapted) model is actually deployed and served in production.
`,

  "learning-roadmap": `
**Week 1 — SFT fundamentals**: understanding and implementing basic Supervised Fine-Tuning on a simple task. Milestone: complete Lab 1, with a working, evaluated fine-tuned model.

**Week 2 — Parameter-efficient techniques**: implementing and comparing LoRA against full fine-tuning. Milestone: complete Lab 2, with a documented comparison of cost and quality.

**Week 3 — Catastrophic forgetting mitigation**: deliberately inducing and then mitigating catastrophic forgetting. Milestone: complete Lab 3, with a documented before/after analysis.

**Week 4 — Alignment techniques**: implementing a simplified DPO training loop for preference-based alignment. Milestone: complete Lab 4, with a working, evaluated implementation.

Next platform skill once this roadmap is complete: **Inference**, covering how a fine-tuned model's forward pass is actually executed efficiently in production.
`,

  "official-docs": `
- **Hugging Face's official PEFT (Parameter-Efficient Fine-Tuning) library documentation** — the authoritative, widely-used reference for LoRA, QLoRA, and related techniques.
- **Hugging Face's official TRL (Transformer Reinforcement Learning) library documentation** — the authoritative reference for RLHF and DPO implementation.
- **OpenAI's official fine-tuning API documentation** — a widely-used, commercially available fine-tuning service reference.
`,

  books: `
- **"Natural Language Processing with Transformers" — Tunstall, von Werra, Wolf** — covers fine-tuning techniques with strong practical, code-focused depth.
- **"Deep Learning" — Goodfellow, Bengio, Courville** — covers the foundational transfer learning concepts this page's techniques directly apply.
`,

  blogs: `
- **The official Hugging Face blog on PEFT, LoRA, and QLoRA** — extensive, practical, technique-specific guidance.
- **OpenAI's official blog on InstructGPT and RLHF** — foundational, detailed explanations of the alignment fine-tuning process.
- **Lilian Weng's blog on RLHF and alignment techniques** — exceptionally thorough, technically rigorous coverage.
`,

  "research-papers": `
- **Hu, E. et al. — "LoRA: Low-Rank Adaptation of Large Language Models"** (2021) — the foundational LoRA paper.
- **Ouyang, L. et al. — "Training Language Models to Follow Instructions with Human Feedback"** (2022, the InstructGPT paper) — the foundational RLHF-for-alignment paper.
- **Dettmers, T. et al. — "QLoRA: Efficient Finetuning of Quantized LLMs"** (2023) — the foundational QLoRA paper.
- **Rafailov, R. et al. — "Direct Preference Optimization: Your Language Model is Secretly a Reward Model"** (2023) — the foundational DPO paper.
`,

  videos: `
- **Hugging Face's official PEFT and TRL tutorial videos** — practical, library-specific fine-tuning walkthroughs.
- **Conference talks on RLHF and alignment techniques** from major AI labs (OpenAI, Anthropic, and others).
- **Andrej Karpathy's talks on fine-tuning and alignment** — clear, accessible explanations of these techniques' practical mechanics.
`,

  "github-repos": `
- **huggingface/peft** — the official Hugging Face PEFT library, implementing LoRA, QLoRA, and related techniques.
- **huggingface/trl** — the official Hugging Face TRL library, implementing RLHF and DPO.
- **artidoro/qlora** — the official QLoRA implementation repository.
`,

  "practice-problems": `
Ordered by skill focus:

1. **Fine-tuning necessity assessment**: given a described task and prior prompting attempts, decide whether fine-tuning is genuinely justified.
2. **Technique selection**: given described resource constraints and quality requirements, choose between full fine-tuning, LoRA, and QLoRA.
3. **Catastrophic forgetting diagnosis**: given described before/after benchmark scores, diagnose whether catastrophic forgetting has occurred and propose a fix.
4. **Alignment technique selection**: given a described alignment objective, choose and justify SFT alone, RLHF, or DPO.
5. **External practice sets**: Hugging Face's official PEFT and TRL tutorials for hands-on fine-tuning implementation practice.
`,

  "architecture-diagram": `
~~~mermaid
flowchart TB
    subgraph Pretraining["Pretraining (not covered here)"]
        BaseModel["Pretrained Base Model"]
    end
    subgraph FineTuningApproaches["Fine-Tuning Approaches"]
        FullFT["Full Fine-Tuning\n(all weights updated)"]
        LoRA["LoRA\n(frozen weights + small\nlow-rank matrices)"]
        QLoRA["QLoRA\n(LoRA + quantized\nfrozen weights)"]
    end
    subgraph AlignmentTechniques["Alignment Techniques"]
        SFT["Supervised Fine-Tuning\n(imitate demonstrations)"]
        RLHF["RLHF\n(reward model + RL)"]
        DPO["DPO\n(direct preference\noptimization)"]
    end
    BaseModel --> FineTuningApproaches
    FineTuningApproaches --> AlignmentTechniques
    AlignmentTechniques --> FinalModel["Fine-Tuned / Aligned Model"]
~~~
`,

  "mind-map": `
~~~mermaid
mindmap
  root((Fine-Tuning))
    Foundations
      Overview
      History GPT BERT LoRA InstructGPT DPO
      Why it exists
      Problem it solves
    When to Fine Tune
      Prompting exhausted first
      Consistency at scale
      Domain knowledge gap
    Supervised Fine Tuning
      Imitate demonstrations
      Training loop mechanics
    Parameter Efficient
      LoRA low rank matrices
      QLoRA quantization
      Frozen weights safeguard
    Alignment
      RLHF three stages
      Reward model
      DPO simpler alternative
    Risks
      Catastrophic forgetting
      Data quality garbage in garbage out
      Mitigation strategies
    Practice
      Interview questions
      Coding problems
      Hands-on labs
      Real projects
~~~
`,
};

export default fineTuning;
