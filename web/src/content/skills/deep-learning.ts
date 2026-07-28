import type { SkillContent } from "../types";

/**
 * Deep Learning — full 50-section knowledge page.
 * Note: code blocks use ~~~ fences (CommonMark-equivalent to backtick fences)
 * so this file needs no backtick escaping inside the template literals.
 */
const deepLearning: SkillContent = {
  overview: `
Deep learning is the branch of machine learning built on **artificial neural networks with many stacked layers** ("deep" stacks, as opposed to the shallow one- or two-layer models of classical ML). Each layer learns to transform its input into a slightly more abstract representation, so the network as a whole learns a hierarchy of features directly from raw data — pixels, waveforms, tokens — without a human hand-engineering what to look for.

For an AI engineer, deep learning is the substrate underneath almost everything you will ship: image classifiers, speech recognizers, recommendation embeddings, and — most importantly today — the transformer-based large language models that power modern AI products. You do not need to derive backpropagation from scratch to build products, but you cannot debug a training run, reason about a model's failure mode, size a GPU budget, or have a credible conversation with an ML team without understanding how gradients flow, why training diverges, and what levers (learning rate, batch size, regularization) actually do.

Key characteristics: deep learning is (1) **representation learning** — features are learned, not designed; (2) **differentiable end-to-end** — every layer must be composed of operations whose gradient can be computed, which is why backpropagation is the single unifying algorithm across every deep architecture; (3) **data- and compute-hungry** — performance scales predictably with more data and more parameters (the empirical "scaling laws" that motivated the LLM era); and (4) **architecture-general** — the same core training loop (forward pass, loss, backward pass, weight update) trains a digit classifier, a convolutional image model, and a billion-parameter transformer alike. See the **Machine Learning** skill for the broader field this specializes, and the **Neural Networks** skill for the single-layer building block this page assumes.
`,

  history: `
Deep learning's history is a story of ideas arriving decades before the hardware and data needed to make them work.

| Year | Milestone |
|------|-----------|
| 1958 | Frank Rosenblatt's **Perceptron** — the first trainable artificial neuron, huge early hype |
| 1969 | Minsky and Papert's *Perceptrons* book proves single-layer perceptrons cannot solve XOR — funding dries up ("first AI winter" for neural nets) |
| 1986 | Rumelhart, Hinton, and Williams popularize **backpropagation** for multi-layer networks, reviving the field |
| 1989 | Yann LeCun applies backprop + convolutions to handwritten digit recognition (precursor to LeNet) |
| 1997 | Hochreiter and Schmidhuber publish **LSTM**, solving vanishing gradients for sequences |
| 2006 | Hinton popularizes "deep belief networks" and layer-wise pretraining — the term **"deep learning"** enters common use |
| 2009 | **ImageNet** dataset released (Fei-Fei Li et al.) — the benchmark that would drive a decade of progress |
| 2012 | **AlexNet** (Krizhevsky, Sutskever, Hinton) wins ImageNet by a huge margin using GPUs and ReLU — the modern deep learning era begins |
| 2014 | **GANs** (Goodfellow et al.) and **Dropout** popularized as a standard regularizer |
| 2015 | **ResNet** (He et al.) introduces residual connections, enabling networks hundreds of layers deep; **batch normalization** published |
| 2015 | **Adam optimizer** published, becomes the default choice for most training |
| 2017 | **"Attention Is All You Need"** introduces the **Transformer**, superseding RNNs for most sequence tasks |
| 2018–2020 | BERT, GPT-2, GPT-3 show transformers scale predictably with data and parameters ("scaling laws") |
| 2020–2025 | Diffusion models for images, instruction-tuned and RLHF'd LLMs, mixture-of-experts, and multimodal models dominate research and production |

The pattern to notice: the underlying math (gradient descent, chain rule) has barely changed since the 1980s. What changed was data (ImageNet, the web), compute (GPUs, then TPUs), and a handful of architectural and optimization tricks (ReLU, batch norm, residual connections, Adam) that made deep networks trainable in practice.
`,

  "why-it-exists": `
Before deep learning, the dominant machine learning workflow was: a domain expert **hand-engineers features** (SIFT and HOG for images, MFCCs for audio, TF-IDF and n-grams for text), and then a relatively simple classical model (logistic regression, SVM, random forest — see the **Machine Learning** skill) learns to separate those hand-built features.

This had a hard ceiling: the quality of the whole system was capped by the quality of the human-designed features, and feature engineering for a new domain could take a research team years. Deep learning exists because Rosenblatt, and later LeCun, Hinton, Bengio, and Schmidhuber, asked a different question: what if the feature extractor itself were learned from data, using the same gradient-based optimization that trains the classifier on top of it?

Stacking many differentiable layers and training the entire pipeline end-to-end with backpropagation meant a network could discover, from raw pixels, that edges compose into textures, textures into parts, and parts into objects — without anyone specifying "look for edges." The 2012 AlexNet result made this concrete and undeniable: a learned feature hierarchy beat decades of hand-engineered computer vision features by a wide margin, once enough data (ImageNet) and compute (GPUs) were available to actually train deep stacks.
`,

  "problem-it-solves": `
Deep learning removes the **feature engineering bottleneck** and, in doing so, unlocks tasks that resisted classical ML for decades:

- **Perceptual tasks**: image recognition, speech recognition, and natural language understanding, where the "right" features are not obvious even to human experts, are now largely solved by learned hierarchical representations.
- **Transfer of effort from humans to compute**: instead of a team spending months designing features, you spend compute-hours training a network to find better ones — a trade that keeps getting more favorable as hardware improves.
- **Unified tooling across domains**: the same backpropagation + gradient descent training loop works for vision (CNNs), sequences (RNNs, Transformers), and structured/tabular data (with less dominance there), letting engineering practices, frameworks, and infrastructure be shared across problem domains.
- **Representation reuse**: features learned for one task (ImageNet classification, next-token prediction) transfer to many downstream tasks via transfer learning and fine-tuning — see the **Fine-Tuning** skill — which is now the default way most production models are built, rather than training from scratch.

What deep learning deliberately does **not** solve: it does not remove the need for good data (garbage in, garbage out is worse for deep nets, which will happily memorize label noise); it does not make small-data problems easy (deep nets are typically data-hungry, and classical ML or few-shot/transfer techniques often win when labeled data is scarce); it does not give you interpretability for free (a 175-billion-parameter network is not a decision tree you can read); and it does not solve reasoning or symbolic tasks reliably out of the box — it approximates functions from data, it does not "understand" in a human sense. Choosing deep learning vs. classical ML is a real engineering decision, not a default; see Comparisons.
`,

  "learning-objectives": `
By the end of this page you should be able to:

1. Explain what makes a network "deep" and why depth enables hierarchical representation learning that shallow models cannot match.
2. Derive, at an intuitive and numeric level, how the forward pass, loss computation, backward pass, and weight update work together as gradient descent via backpropagation.
3. Choose an activation function (ReLU, sigmoid, tanh, softmax) appropriately and explain why ReLU dominates modern hidden layers.
4. Diagnose vanishing and exploding gradients and apply the standard mitigations: careful weight initialization, batch normalization, and residual connections.
5. Compare optimizers (SGD with momentum vs. Adam) and correctly identify learning rate as the single most important hyperparameter to tune.
6. Apply deep-learning-specific regularization: dropout, weight decay, early stopping, and data augmentation, and explain when each is appropriate.
7. Build, train, and evaluate a small feedforward network in PyTorch, including the full training loop.
8. Explain why GPUs/accelerators are necessary for deep learning and how batch size trades off memory, speed, and generalization.
9. Apply transfer learning and fine-tuning as the default modern practice instead of training from scratch.
10. Reason about production tradeoffs: model size vs. latency, and the basics of quantization, pruning, and ONNX-style serving formats.
`,

  prerequisites: `
- **Required**: comfort with the **Machine Learning** skill's fundamentals (train/test split, loss functions, overfitting, gradient descent at a high level) and basic Python. Linear algebra (vectors, matrices, dot products) and calculus (derivatives, chain rule) at an undergraduate level make the internals sections much easier, though this page re-derives what it needs.
- **Helpful**: NumPy/array programming fluency (see the **Python** skill), and familiarity with what a tensor is (an n-dimensional array).
- **For internals sections**: the chain rule from single-variable calculus is the only real prerequisite for understanding backpropagation; everything else is bookkeeping.

Dependency links: **Machine Learning** (the parent field) → this page → **Neural Networks** (the single-layer building block this page builds on), **CNNs**, **RNNs**, **Transformers**, **Attention**, **Embeddings**, and **Vector Search** all assume the material here. This page is the hub that those six architecture-specific skills branch from.
`,

  "beginner-concepts": `
### What "deep" actually means

A neural network is a stack of layers, each computing output = activation(W times input + b) for a weight matrix W and bias vector b. A "shallow" network has one hidden layer; a **deep** network stacks many such layers. Depth matters because each layer can build on the abstractions of the one before it: layer 1 might detect edges, layer 2 combines edges into corners and textures, layer 3 combines those into object parts, and so on — a hierarchy no single layer, however wide, can represent as efficiently. This is the core reason deep learning beats classical ML on perceptual tasks: the hierarchy is learned automatically instead of hand-engineered. See the **Neural Networks** skill for the single-layer mechanics (weights, biases, one forward pass) this section assumes.

### The training loop, at a glance

Every deep network is trained by repeating four steps until the loss stops improving:

~~~text
1. Forward pass:  input -> layer 1 -> layer 2 -> ... -> output (prediction)
2. Loss:          compare prediction to the true label with a loss function
3. Backward pass: compute how much each weight contributed to the loss (gradients)
4. Update:        nudge every weight slightly opposite its gradient
~~~

This loop IS deep learning. Every architecture (CNN, RNN, Transformer) just changes what happens inside the "layers" — the four-step loop above never changes.

### A tiny worked numeric example

Take the smallest possible network: one input, one weight w = 0.5, one bias b = 0.0, no hidden layer, predicting y_hat = w times x. Say x = 2, and the true target y = 3. Use squared error loss L = (y_hat minus y) squared.

~~~text
Forward pass:
  y_hat = w * x = 0.5 * 2 = 1.0
  L = (y_hat - y)^2 = (1.0 - 3)^2 = 4.0

Backward pass (chain rule):
  dL/dy_hat = 2 * (y_hat - y) = 2 * (1.0 - 3) = -4.0
  dy_hat/dw = x = 2
  dL/dw = dL/dy_hat * dy_hat/dw = -4.0 * 2 = -8.0

Weight update (learning rate lr = 0.05):
  w_new = w - lr * dL/dw = 0.5 - 0.05 * (-8.0) = 0.5 + 0.4 = 0.9

Check: with w = 0.9, y_hat = 0.9 * 2 = 1.8 -- closer to 3 than 1.0 was.
~~~

That is the entire algorithm — repeated millions of times, across millions of weights, on GPUs. Every "deep learning is complicated" feeling comes from scale and bookkeeping, not from new math.

### Activation functions: why you need them at all

Without a non-linear activation function between layers, stacking any number of linear layers collapses mathematically into a single linear layer (a matrix product of linear maps is still linear) — depth would buy you nothing. Non-linear activations are what let deep networks approximate arbitrarily complex functions.

~~~python
import torch
import torch.nn.functional as F

x = torch.tensor([-2.0, -0.5, 0.0, 0.5, 2.0])

print(F.relu(x))         # tensor([0.0, 0.0, 0.0, 0.5, 2.0])  -- zero below 0, identity above
print(torch.sigmoid(x))  # squashes to (0, 1) -- classic "probability" output
print(torch.tanh(x))     # squashes to (-1, 1) -- zero-centered sigmoid
~~~

### A minimal PyTorch network you can read end to end

~~~python
import torch
import torch.nn as nn

class TinyNet(nn.Module):
    """Two-layer feedforward network: input -> hidden -> output."""
    def __init__(self, in_features: int, hidden: int, out_features: int):
        super().__init__()
        self.fc1 = nn.Linear(in_features, hidden)
        self.fc2 = nn.Linear(hidden, out_features)

    def forward(self, x: torch.Tensor) -> torch.Tensor:
        x = torch.relu(self.fc1(x))    # non-linearity between layers
        return self.fc2(x)             # raw scores (logits), no activation here

model = TinyNet(in_features=4, hidden=8, out_features=2)
sample = torch.randn(1, 4)             # batch of 1, 4 features
print(model(sample).shape)             # torch.Size([1, 2])
~~~

Common beginner trap: forgetting the non-linearity between layers (turns "deep" into an expensive way of writing one linear layer) — covered further in Anti-Patterns.
`,

  "intermediate-concepts": `
### Loss functions and what they encode

The loss function defines what "good" means to the optimizer. Cross-entropy for classification, mean squared error (MSE) for regression:

~~~python
import torch
import torch.nn as nn

logits = torch.tensor([[2.0, 0.5, -1.0]])   # raw scores for 3 classes
target = torch.tensor([0])                  # true class index

criterion = nn.CrossEntropyLoss()           # applies softmax internally
loss = criterion(logits, target)
print(loss.item())                          # a single scalar to minimize
~~~

Softmax converts raw logits into a probability distribution that sums to 1 — the standard output activation for multi-class classification:

~~~python
import torch.nn.functional as F
probs = F.softmax(torch.tensor([2.0, 0.5, -1.0]), dim=0)
print(probs)   # tensor([0.79, 0.18, 0.03]) -- highest logit gets highest probability
~~~

### The full PyTorch training loop

~~~python
import torch
import torch.nn as nn
import torch.optim as optim
from torch.utils.data import DataLoader, TensorDataset

# Synthetic dataset: 1000 samples, 4 features, 3 classes
X = torch.randn(1000, 4)
y = torch.randint(0, 3, (1000,))
loader = DataLoader(TensorDataset(X, y), batch_size=32, shuffle=True)

model = nn.Sequential(
    nn.Linear(4, 16), nn.ReLU(),
    nn.Linear(16, 16), nn.ReLU(),
    nn.Linear(16, 3),
)
criterion = nn.CrossEntropyLoss()
optimizer = optim.Adam(model.parameters(), lr=1e-3)   # Adam: the default modern choice

for epoch in range(10):
    total_loss = 0.0
    for xb, yb in loader:
        optimizer.zero_grad()          # clear gradients from the previous step
        logits = model(xb)             # forward pass
        loss = criterion(logits, yb)   # loss computation
        loss.backward()                # backward pass -- fills .grad on every parameter
        optimizer.step()               # weight update using those gradients
        total_loss += loss.item()
    print(f"epoch {epoch}: loss={total_loss / len(loader):.4f}")
~~~

Every line above maps directly to the four-step loop from Beginner Concepts: zero_grad clears stale gradients (PyTorch accumulates by default), backward computes them via autograd (automatic backpropagation), step applies the optimizer's update rule.

### Optimizers: SGD with momentum vs. Adam

Plain SGD updates weights straight against the gradient; momentum adds a "velocity" term so the optimizer keeps moving in a consistent direction and dampens oscillation across steep ravines in the loss surface:

~~~python
optimizer = optim.SGD(model.parameters(), lr=0.01, momentum=0.9)
~~~

**Adam** (Adaptive Moment Estimation) maintains a per-parameter running average of both the gradient (momentum) and the squared gradient (an adaptive, per-parameter learning rate), which is why it converges fast with little tuning and is the default starting point for most modern training:

~~~python
optimizer = optim.Adam(model.parameters(), lr=1e-3, betas=(0.9, 0.999))
~~~

**Learning rate is the single most important hyperparameter.** Too high and the loss diverges or oscillates; too low and training is unbearably slow or gets stuck in a poor local region. A learning rate schedule (warmup then decay, or cosine annealing) is standard in production training runs.

### Regularization for deep nets

~~~python
import torch.nn as nn

model = nn.Sequential(
    nn.Linear(784, 256), nn.ReLU(), nn.Dropout(p=0.3),   # drop 30% of activations at train time
    nn.Linear(256, 128), nn.ReLU(), nn.Dropout(p=0.3),
    nn.Linear(128, 10),
)

# Weight decay (L2 regularization) penalizes large weights, discouraging over-reliance
# on any single feature/neuron.
optimizer = optim.Adam(model.parameters(), lr=1e-3, weight_decay=1e-4)
~~~

- **Dropout** randomly zeroes activations during training (never at inference — call model.eval()), forcing the network to not rely on any single neuron and approximating an ensemble of subnetworks.
- **Weight decay** (L2 penalty on weights) keeps weights small, which tends to produce smoother, more generalizable functions.
- **Early stopping** halts training when validation loss stops improving, before the model starts memorizing training-set noise.
- **Data augmentation** (random crops/flips for images, noise injection for audio) manufactures additional training variety from existing data, which is often the highest-leverage regularizer for perceptual tasks.

### Batch normalization

~~~python
nn.Sequential(
    nn.Linear(256, 256),
    nn.BatchNorm1d(256),   # normalizes activations to zero mean, unit variance per batch
    nn.ReLU(),
)
~~~

Batch norm re-centers and re-scales each layer's activations using batch statistics, which stabilizes training, allows higher learning rates, and reduces sensitivity to initialization — one of the three standard mitigations for vanishing/exploding gradients discussed in Advanced Concepts.
`,

  "advanced-concepts": `
### Vanishing and exploding gradients

Backpropagation multiplies gradients layer by layer via the chain rule. In a deep network, if each layer's local gradient is consistently less than 1 (common with sigmoid/tanh saturating near their flat regions), the product **vanishes** toward zero by the time it reaches early layers — those layers stop learning. If local gradients are consistently greater than 1, the product **explodes**, causing unstable, diverging updates (loss becomes NaN).

| Cause | Symptom | Mitigation |
|-------|---------|------------|
| Sigmoid/tanh saturation in deep stacks | Early layers' weights barely change; loss plateaus | Use ReLU-family activations instead |
| Poor weight initialization (too large/small) | Activations shrink or blow up layer over layer | Careful init: Xavier/Glorot (tanh), He/Kaiming (ReLU) |
| Very deep plain stacks (no skip paths) | Gradient signal decays over many layers | Residual (skip) connections — gradient has a direct path backward |
| Unnormalized activations drifting during training | Training destabilizes as distributions shift ("internal covariate shift") | Batch normalization / layer normalization |
| Long sequences in RNNs | Gradient vanishes across time steps | Gated architectures (LSTM/GRU) — see the **RNNs** skill; or replace with **Transformers**, which do not have this recurrent gradient path at all |

~~~python
import torch
import torch.nn as nn

class ResidualBlock(nn.Module):
    """The residual-connection trick that let ResNet reach 100+ layers."""
    def __init__(self, dim: int):
        super().__init__()
        self.fc1 = nn.Linear(dim, dim)
        self.fc2 = nn.Linear(dim, dim)

    def forward(self, x):
        identity = x
        out = torch.relu(self.fc1(x))
        out = self.fc2(out)
        return torch.relu(out + identity)   # skip connection: gradient can flow through "+ identity"
                                             # even if the learned path's gradient vanishes
~~~

### Why ReLU dominates modern hidden layers

ReLU(x) = max(0, x). Its gradient is exactly 1 for any positive input and 0 for negative input — no saturation on the positive side, so gradients do not shrink through many stacked ReLU layers the way they do through sigmoid/tanh. It is also nearly free to compute. The known failure mode is "dying ReLU" (a neuron stuck outputting 0 for all inputs, so its gradient is permanently 0); mitigations include Leaky ReLU, GELU (used in most modern Transformers), or careful (He/Kaiming) initialization.

### Weight initialization

Initializing all weights to zero makes every neuron in a layer compute the identical gradient (symmetry never breaks — the network cannot learn diverse features). Random initialization is required, but its **scale** matters: too large causes exploding activations/gradients, too small causes vanishing ones.

~~~python
import torch.nn as nn

layer = nn.Linear(256, 256)
nn.init.kaiming_normal_(layer.weight, nonlinearity="relu")   # He init -- matched to ReLU's variance
# nn.init.xavier_normal_(layer.weight)                        # Glorot init -- matched to tanh/sigmoid
~~~

PyTorch's default initializers are already sensible for standard layers, but custom architectures and very deep networks often need this set explicitly.

### GPU/accelerator necessity: why deep learning needs parallel hardware

A forward pass through a linear layer is a matrix multiplication: a batch of B inputs times a weight matrix is a B-by-in times in-by-out matrix product — millions of independent multiply-adds that have no data dependency on each other. CPUs execute a handful of these per cycle across a few cores; GPUs execute thousands in parallel across thousands of cores designed exactly for this kind of dense, regular arithmetic (and modern accelerators like TPUs go further with dedicated matrix-multiply units). This is why training a modern deep network on CPU can be 10 to 100x slower than on a GPU, and why the entire deep learning tooling stack (CUDA, cuDNN, PyTorch's autograd) exists to keep tensors on the accelerator and minimize host-device data transfer.

~~~python
import torch

device = torch.device("cuda" if torch.cuda.is_available() else "cpu")
model = model.to(device)
xb = xb.to(device)          # inputs must live on the same device as the model
# Mixed precision (fp16/bf16) roughly doubles throughput and halves memory on modern GPUs
scaler = torch.cuda.amp.GradScaler()
with torch.autocast(device_type="cuda", dtype=torch.float16):
    loss = criterion(model(xb), yb)
scaler.scale(loss).backward()
scaler.step(optimizer)
scaler.update()
~~~

### Batch size tradeoffs

| Batch size | Effect |
|------------|--------|
| Small (e.g. 8-32) | Noisier gradient estimates act as a mild regularizer, often better generalization; more weight updates per epoch; less GPU memory; slower wall-clock throughput per epoch |
| Large (e.g. 256-4096+) | Smoother, more accurate gradient estimate; better hardware utilization and throughput; needs proportionally larger learning rate (with warmup) to converge equally well; more GPU memory; can generalize worse if not compensated |

Gradient accumulation (summing gradients over several small "micro-batches" before one optimizer step) simulates a larger batch size when GPU memory is the binding constraint.

### Transfer learning and fine-tuning as default practice

Training a large network from random initialization is rarely the first move in production today. Instead, teams start from a model pretrained on a large generic dataset and adapt it:

~~~python
import torchvision.models as models
import torch.nn as nn

backbone = models.resnet18(weights=models.ResNet18_Weights.DEFAULT)  # pretrained on ImageNet
for param in backbone.parameters():
    param.requires_grad = False          # freeze the learned feature extractor

backbone.fc = nn.Linear(backbone.fc.in_features, num_classes)   # replace + train only the head
~~~

Freezing early layers and retraining only the final layers ("feature extraction") is cheap and works well when the target dataset is small and similar to the pretraining data; unfreezing more layers and fine-tuning with a small learning rate works better when more target data is available or the domain differs more. See the **Fine-Tuning** skill for depth on this, including parameter-efficient methods (LoRA, adapters) that dominate LLM adaptation.

### Model compression for production: quantization and pruning

- **Quantization** stores weights/activations in lower precision (int8 instead of float32), cutting memory roughly 4x and often speeding up inference, at a small, usually acceptable, accuracy cost.
- **Pruning** removes weights or entire neurons/channels that contribute little to the output, shrinking the model and its compute cost.
- **Knowledge distillation** trains a small "student" model to mimic a large "teacher" model's outputs, often recovering most of the teacher's accuracy at a fraction of the size.

These form the production-size/latency tradeoff explored in depth in Performance and the production sections below.
`,

  "internal-working": `
Backpropagation is reverse-mode automatic differentiation applied to the computational graph of a network. Every operation (matrix multiply, add, ReLU) is a node; the forward pass builds this graph while computing values, and the backward pass walks it in reverse, applying the chain rule at every node to compute how much each weight contributed to the final loss.

~~~mermaid
flowchart LR
    X["Input x"] --> L1["Layer 1: z1 = W1x + b1"]
    L1 --> A1["ReLU(z1) = h1"]
    A1 --> L2["Layer 2: z2 = W2h1 + b2"]
    L2 --> A2["Softmax(z2) = y_hat"]
    A2 --> LOSS["Loss L(y_hat, y)"]

    LOSS -.dL/dz2.-> L2
    L2 -.dL/dh1 via W2^T.-> A1
    A1 -.dL/dz1 via ReLU'.-> L1
    L1 -.dL/dW1, dL/db1.-> UPD["Optimizer: W -= lr * dL/dW"]
~~~

Step by step:

1. **Forward pass**: input flows through each layer's linear transform and activation, producing intermediate activations (cached for later) and finally a prediction.
2. **Loss computation**: the prediction and true label are compared with a scalar loss function.
3. **Backward pass**: starting from dL/dL = 1 at the loss, the chain rule is applied backward through every operation, each layer computing its local gradient using the gradient handed to it from the layer after it and its own cached forward-pass values — this is exactly why activations must be cached during the forward pass.
4. **Weight update**: once every weight's gradient (dL/dW) is known, the optimizer nudges each weight opposite its gradient, scaled by the learning rate (SGD: W -= lr times dL/dW; Adam adds per-parameter adaptive scaling, see Intermediate Concepts).

In PyTorch, this entire process is automated by **autograd**: every tensor operation on a tensor with requires_grad=True is recorded onto a dynamic computational graph, and calling .backward() walks that graph in reverse, populating .grad on every leaf tensor (the parameters). optimizer.zero_grad() exists because PyTorch accumulates gradients into .grad across multiple .backward() calls by default (useful for gradient accumulation, dangerous if forgotten between training steps).

Deeper networks simply mean a longer chain of these local-gradient multiplications, which is precisely why vanishing/exploding gradients (Advanced Concepts) are an internal-mechanics problem, not an incidental bug.
`,

  architecture: `
A senior engineer thinks about deep learning systems at two levels: the **training-time architecture** (how the network and optimization loop are structured) and the **serving-time architecture** (how a trained model becomes a production dependency).

### Training-time architecture

~~~mermaid
flowchart TB
    subgraph Data["Data pipeline"]
        DS["Dataset / DataLoader"]
        Aug["Augmentation / preprocessing"]
    end
    subgraph Train["Training loop"]
        FWD["Forward pass (model)"]
        LOSS["Loss function"]
        BWD["Backward pass (autograd)"]
        OPT["Optimizer step (SGD/Adam)"]
    end
    subgraph Track["Experiment tracking"]
        CKPT["Checkpoints"]
        LOG["Metrics logger (loss, accuracy, LR)"]
    end
    DS --> Aug --> FWD --> LOSS --> BWD --> OPT
    OPT --> FWD
    FWD --> LOG
    OPT --> CKPT
~~~

Key facts: the DataLoader and augmentation pipeline typically run on CPU workers in parallel with GPU compute (so the accelerator is never waiting on data); checkpoints must be saved periodically (training runs can take days and hardware fails); metrics (loss curves, learning rate, gradient norms) are logged every step so divergence is caught early, not after wasting a full run.

### Serving-time (application) architecture

~~~text
inference-service/
├── model/
│   ├── weights.safetensors     # never pickle for production (see Security)
│   └── config.json             # architecture hyperparameters needed to rebuild the model
├── src/
│   ├── preprocessing/          # must exactly match training-time preprocessing
│   ├── inference/               # batching, device placement, forward-pass-only code
│   ├── postprocessing/          # softmax->labels, thresholding, decoding
│   └── api/                     # FastAPI/gRPC endpoint wrapping the model
└── tests/                       # golden-output regression tests against fixed inputs
~~~

Rules: preprocessing at serving time must be byte-for-byte identical to training-time preprocessing (a mismatched normalization constant is one of the most common silent production bugs); the model is loaded once at process startup, not per request; inference runs with torch.no_grad() (no need to build a backward graph) and model.eval() (disables dropout, freezes batch-norm running statistics).
`,

  "data-flow": `
Tracing one training step end to end, followed by one inference request:

~~~mermaid
sequenceDiagram
    participant Loader as DataLoader
    participant Model as Network (forward)
    participant Loss as Loss fn
    participant Auto as Autograd (backward)
    participant Opt as Optimizer

    Loader->>Model: batch of (x, y)
    Model->>Model: layer 1 -> activation -> layer 2 -> ... -> logits
    Model->>Loss: logits, y
    Loss->>Loss: compute scalar loss L
    Loss->>Auto: L.backward()
    Auto->>Auto: walk computational graph in reverse, apply chain rule at each op
    Auto->>Opt: populate .grad on every parameter
    Opt->>Model: update every weight: W -= lr * update_rule(grad)
    Note over Loader,Opt: repeat for every batch, every epoch, until validation loss plateaus
~~~

The most misunderstood part is **why zero_grad exists**: PyTorch accumulates gradients into each parameter's .grad tensor across backward() calls by default (deliberately, to support gradient accumulation for effectively larger batch sizes). Forgetting optimizer.zero_grad() before the next batch's backward() silently sums gradients from multiple batches into one update — a subtle bug that looks like unstable training rather than an obvious crash.

For an inference request in a served model, the flow is: request JSON, then preprocessing (must match training exactly), then a tensor moved to the model's device, then a forward pass only with no graph construction (torch.no_grad()), then output logits, then postprocessing (softmax, thresholding, label mapping), then a response serialized back to JSON. There is no loss, no backward pass, and no optimizer at inference time — a common interview question is exactly this distinction.
`,

  "production-usage": `
### Frameworks and tooling

**PyTorch** is the dominant framework for research and increasingly for production (torch.compile, TorchScript, and ExecuTorch cover the deployment gap that used to be TensorFlow's advantage). **JAX** is used heavily in research and at Google-scale training for its functional, composable transformations (grad, jit, vmap, pmap). Higher-level libraries (PyTorch Lightning, Hugging Face Trainer/Accelerate) wrap the training loop shown in Intermediate Concepts to remove boilerplate (multi-GPU, mixed precision, checkpointing) while keeping the underlying loop identical.

~~~python
# Typical production training entrypoint sketch (config-driven, not hardcoded)
import torch
from torch.utils.data import DataLoader

def train(cfg):
    device = torch.device(cfg.device)
    model = build_model(cfg.model).to(device)
    train_loader = DataLoader(build_dataset(cfg.data, split="train"),
                               batch_size=cfg.batch_size, shuffle=True, num_workers=4)
    optimizer = torch.optim.AdamW(model.parameters(), lr=cfg.lr, weight_decay=cfg.weight_decay)
    scheduler = torch.optim.lr_scheduler.CosineAnnealingLR(optimizer, T_max=cfg.epochs)

    for epoch in range(cfg.epochs):
        model.train()
        for xb, yb in train_loader:
            xb, yb = xb.to(device), yb.to(device)
            optimizer.zero_grad()
            loss = compute_loss(model(xb), yb)
            loss.backward()
            torch.nn.utils.clip_grad_norm_(model.parameters(), max_norm=1.0)  # exploding-gradient guard
            optimizer.step()
        scheduler.step()
        save_checkpoint(model, optimizer, epoch, cfg.checkpoint_dir)
~~~

### Non-negotiables for production training

1. **Config-driven runs** (Hydra/YAML), never hardcoded hyperparameters — every run must be reproducible from its config plus a seed.
2. **Checkpointing** every N steps, including optimizer state, so a crashed multi-day run resumes instead of restarting.
3. **Gradient clipping** as a cheap insurance policy against occasional exploding gradients, especially with RNNs or high learning rates.
4. **Mixed precision** (fp16/bf16) by default on modern GPUs for throughput and memory headroom.
5. **Deterministic seeding** for debugging (torch.manual_seed, cudnn.deterministic) — accepting the small speed cost when reproducing a bug matters more than raw speed.

### Experiment tracking

Weights and Biases, MLflow, or TensorBoard log loss curves, learning rate schedules, gradient norms, and sample predictions per run, and are essential once more than one person is training more than one model.
`,

  "industry-examples": `
- **Google**: Transformer architecture originated at Google Brain; TPUs were purpose-built accelerators for exactly the matrix-multiply-heavy workloads deep learning demands; DeepMind's AlphaFold used deep learning to solve protein structure prediction, a decades-old open scientific problem.
- **OpenAI**: GPT-series large language models are deep Transformer stacks trained with the same backpropagation and gradient descent loop described on this page, just at a scale of hundreds of billions of parameters and enormous compute budgets — see the **Transformers** skill for the architecture specifics.
- **Tesla**: Autopilot/FSD's perception stack is a large multi-task CNN/Transformer hybrid processing camera feeds in real time, trained on fleet-scale driving data — a canonical example of production computer vision deep learning under hard latency constraints.
- **NVIDIA**: builds the CUDA/cuDNN software stack and GPU hardware that essentially the entire industry's deep learning training and inference runs on; also publishes widely used architectures and optimization techniques (mixed precision training, TensorRT for inference optimization).
- **Meta**: PyTorch originated at Meta (then Facebook AI Research) and is now the most widely used deep learning framework; Meta also uses deep learning at massive scale for content ranking, recommendation, and translation.
- **Spotify / Netflix**: use deep learning (often via learned embeddings, see the **Embeddings** skill) for recommendation ranking, where classical collaborative filtering has been substantially replaced or augmented by learned representations.

Pattern to notice: every serious deep learning deployment separates a heavy, GPU-bound training phase (run infrequently, on dedicated infrastructure) from a lighter, latency-sensitive inference phase (run constantly, often on cheaper or specialized hardware, sometimes after quantization).
`,

  "best-practices": `
1. **Always start with a working baseline before adding complexity** — a small network that trains correctly on a tiny subset of data (can it overfit 10 examples to near-zero loss?) is the fastest sanity check that your data pipeline and loss are wired correctly.
2. **Overfit a tiny batch first.** If a model cannot memorize 10-20 examples, the bug is in your code, not your hyperparameters.
3. **Tune learning rate before anything else** — it is the highest-leverage hyperparameter; a learning-rate range test (increasing LR each step and watching loss) finds a good starting point quickly.
4. **Use Adam (or AdamW) as your default optimizer** unless you have a specific reason (well-tuned SGD+momentum can generalize slightly better for some vision tasks, but costs more tuning time).
5. **Normalize your inputs** (zero mean, unit variance, or per the pretrained model's expected normalization when fine-tuning) — unnormalized inputs slow or break training.
6. **Monitor training AND validation loss together**; a widening gap is the earliest overfitting signal, well before validation accuracy visibly drops.
7. **Use mixed precision by default on modern GPUs** — near-free throughput and memory gains with negligible accuracy impact for most architectures.
8. **Clip gradients** when training RNNs or very deep networks, or whenever you observe occasional loss spikes.
9. **Prefer transfer learning/fine-tuning over training from scratch** whenever a relevant pretrained model exists — it is almost always cheaper and better, especially with limited data.
10. **Version your data, code, and config together** with every checkpoint — an unreproducible training run is a production liability.
11. **Set a fixed random seed for debugging runs**, but don't over-trust a single seed's result for architecture/hyperparameter comparisons — average over a few seeds.
12. **Log gradient norms and activation statistics**, not just loss — silent vanishing/exploding gradients often show up here before the loss curve looks obviously wrong.
`,

  "anti-patterns": `
### Forgetting model.eval() / torch.no_grad() at inference

~~~python
# WRONG: dropout still active, batch norm still using batch statistics,
# and a full autograd graph is built for every request -- wastes memory and time
def predict_bad(model, x):
    return model(x)

# RIGHT
@torch.no_grad()
def predict_good(model, x):
    model.eval()          # disable dropout, freeze batch-norm running stats
    return model(x)
~~~

### Forgetting optimizer.zero_grad()

~~~python
# WRONG: gradients silently accumulate across batches, corrupting every update
for xb, yb in loader:
    loss = criterion(model(xb), yb)
    loss.backward()
    optimizer.step()

# RIGHT
for xb, yb in loader:
    optimizer.zero_grad()
    loss = criterion(model(xb), yb)
    loss.backward()
    optimizer.step()
~~~

### Other production-grade anti-patterns

- **Mismatched train/inference preprocessing** — a different normalization constant, image resize method, or tokenization at serving time than at training time silently degrades accuracy with no error thrown.
- **No non-linearity between layers** — stacking linear layers with no activation collapses to one linear layer; "depth" buys nothing.
- **Ignoring the train/validation loss gap** — chasing training loss to zero while validation loss rises is textbook overfitting, invisible if only training loss is watched.
- **Picking batch size purely by "what fits in memory"** without considering the learning-rate relationship — a much larger batch size with an unchanged learning rate often trains worse, not better.
- **Training from scratch when a pretrained model exists** for a similar task — usually slower, more data-hungry, and worse than fine-tuning (see the **Fine-Tuning** skill).
- **Not seeding / not tracking configs**, making a good result impossible to reproduce or debug later.
- **Treating validation accuracy as the only metric** — for imbalanced classes or asymmetric costs, accuracy hides real failure modes; use precision/recall/F1 or task-specific metrics (see the **Machine Learning** skill).
- **Deploying the largest model you can train** without checking latency/cost budgets — see Performance for the size/latency tradeoff.
`,

  performance: `
### Rule zero: measure before you optimize

~~~python
import torch
from torch.profiler import profile, ProfilerActivity

with profile(activities=[ProfilerActivity.CPU, ProfilerActivity.CUDA]) as prof:
    model(xb)
print(prof.key_averages().table(sort_by="cuda_time_total", row_limit=10))
~~~

The PyTorch profiler (or nvidia-smi / nsight for GPU-level detail) tells you whether time is spent in data loading, the forward pass, the backward pass, or host-device transfer — optimizing the wrong stage wastes engineering time.

### The optimization hierarchy (apply in order)

1. **Fix the data pipeline first** — if the GPU sits idle waiting for the CPU-bound DataLoader, more GPU compute buys nothing. Increase num_workers, use pin_memory=True, and prefetch.
2. **Use mixed precision (fp16/bf16)** — typically 1.5-3x throughput and roughly half the memory on modern GPUs, near-zero accuracy cost.
3. **Increase batch size to the memory ceiling** (with a matching learning-rate adjustment) to maximize GPU utilization; use gradient accumulation if memory-bound but a larger effective batch is desired.
4. **torch.compile()** (PyTorch 2.x) fuses operations and generates optimized kernels, often a meaningful free speedup with one line of code.
5. **Reduce model size where accuracy allows** — fewer/narrower layers, or switch to a more efficient architecture (e.g. MobileNet-style over a full ResNet for edge deployment).
6. **Distill or quantize for inference** — a distilled or int8-quantized model can be several times faster and smaller with modest accuracy cost (see Advanced Concepts).
7. **Scale to multiple GPUs/nodes** only after single-GPU efficiency is good — distributed training multiplies inefficiency as well as throughput.

### Numbers worth knowing

- Mixed precision training: commonly 1.5-3x speedup on NVIDIA Tensor Core GPUs vs. full fp32.
- int8 post-training quantization: roughly 4x smaller model, often 2-4x faster CPU inference, typically 1-2 percentage points of accuracy cost, sometimes less.
- Batch size doubling roughly doubles GPU memory usage for activations; it does not double training speed 1:1 due to fixed overheads and non-compute time (data loading, host-device sync).
`,

  scalability: `
Deep learning scales along two very different axes: **more data/parameters during training** and **more concurrent requests during inference**.

### Training-time scaling

~~~mermaid
flowchart LR
    subgraph Single["Single GPU"]
        M1["Model + gradients + optimizer state"]
    end
    subgraph DataParallel["Data parallel (multi-GPU, one node)"]
        G1["GPU 1: full model copy"] --- G2["GPU 2: full model copy"]
        G1 & G2 --> Sync["All-reduce gradients across GPUs"]
    end
    subgraph ModelParallel["Model / tensor parallel (model too big for one GPU)"]
        L1["GPU 1: layers 1-N/2"] --> L2["GPU 2: layers N/2-N"]
    end
    Single --> DataParallel --> ModelParallel
~~~

- **Data parallelism**: each GPU holds a full copy of the model, processes a different data shard, and gradients are averaged (all-reduced) across GPUs before each update — the standard first step to scale training, and what torch.nn.parallel.DistributedDataParallel implements.
- **Model/tensor parallelism**: used when a single model no longer fits in one GPU's memory (large Transformers) — different layers or even different slices of each layer live on different GPUs, requiring careful communication scheduling.
- **Pipeline parallelism**: splits the network into stages across GPUs, overlapping different micro-batches' forward/backward passes across stages like an assembly line, to keep every GPU busy.

### Inference-time scaling

| Bottleneck | Answer |
|------------|--------|
| High request volume, latency-sensitive | Batch multiple requests together on the accelerator (dynamic batching), horizontal replicas behind a load balancer |
| Model too large/slow for target latency | Quantization, pruning, distillation, or a smaller architecture variant |
| Cold start (serverless GPU) | Keep-warm instances, smaller models on the hot path, model caching |
| Cost at scale | Batch inference for non-real-time workloads; spot/preemptible instances for training; right-sized instance types for inference |

Vector similarity search over learned embeddings (a common deep-learning-adjacent production component) has its own scaling story — see the **Vector Search** skill.
`,

  security: `
### Deep-learning-specific attack surface

1. **Unsafe model file formats**: many older checkpoint formats (Python pickle-based, including some .pt/.pth files) execute arbitrary code on load. Never load a checkpoint from an untrusted source with plain torch.load without safety checks; prefer **safetensors**, a format designed to hold only tensor data with no code execution path.
2. **Adversarial examples**: small, often human-imperceptible input perturbations can be crafted to flip a model's prediction with high confidence — a real concern for models exposed to user-controlled input in security-sensitive contexts (fraud detection, content moderation, autonomous systems).
3. **Data poisoning**: an attacker who can influence training data (e.g. crowd-sourced labels, scraped web data, user feedback loops) can bias the model or plant backdoors that trigger on specific inputs.
4. **Model extraction / inversion**: repeated queries to a served model can sometimes reconstruct training data (membership inference) or approximate the model's weights closely enough to steal it — rate limiting and output restriction reduce this exposure.
5. **Prompt/input injection into downstream systems**: when a deep learning model's output feeds into another system (search, code execution, agent tool calls), unvalidated model output is an injection vector just like any other untrusted input.

### Supply chain and secrets

- Audit third-party pretrained weights and datasets for provenance the same way you would audit a software dependency — malicious or poisoned pretrained weights are a real, documented risk.
- Never bake API keys or credentials into training scripts or notebooks committed to version control (see the **Secrets Management** skill).
- Serve models behind authenticated, rate-limited endpoints; do not expose raw model internals (gradients, logits when unnecessary) that make extraction or inversion attacks easier.

See the dedicated **OWASP Top 10** and **Secrets Management** skills for the broader application-security context this sits inside.
`,

  testing: `
Testing deep learning code splits into two very different concerns: testing the **software** (deterministic, standard unit testing) and validating the **model** (statistical, never "pass/fail" in the traditional sense).

~~~python
import torch
import pytest
from mymodel import TinyNet

def test_forward_pass_shape():
    """Software test: the architecture wires shapes correctly."""
    model = TinyNet(in_features=4, hidden=8, out_features=3)
    x = torch.randn(5, 4)          # batch of 5
    out = model(x)
    assert out.shape == (5, 3)

def test_overfits_tiny_batch():
    """Model sanity test: the training loop can memorize a handful of examples.
    If this fails, the bug is in the data pipeline, loss, or optimizer wiring --
    not in hyperparameters."""
    model = TinyNet(4, 8, 3)
    x = torch.randn(8, 4)
    y = torch.randint(0, 3, (8,))
    optimizer = torch.optim.Adam(model.parameters(), lr=1e-2)
    criterion = torch.nn.CrossEntropyLoss()
    for _ in range(200):
        optimizer.zero_grad()
        loss = criterion(model(x), y)
        loss.backward()
        optimizer.step()
    assert loss.item() < 0.05

def test_gradients_flow():
    """Every parameter should receive a non-None, non-zero gradient after backward()."""
    model = TinyNet(4, 8, 3)
    x, y = torch.randn(2, 4), torch.randint(0, 3, (2,))
    torch.nn.CrossEntropyLoss()(model(x), y).backward()
    for name, param in model.named_parameters():
        assert param.grad is not None, f"{name} received no gradient"
~~~

### The senior testing doctrine for deep learning

- **Unit-test the pipeline, not the accuracy number**: shape correctness, no-NaN outputs, gradients flowing to every parameter, preprocessing/postprocessing round-trips.
- **Regression-test against golden outputs**: for a fixed input and fixed model checkpoint, the output should not silently change across code refactors.
- **Validate on a held-out set the model never saw during development**, not just the validation set used for hyperparameter tuning — repeated tuning against the same validation set leaks information (see the **Machine Learning** skill on the train/validation/test split discipline).
- **Slice-based evaluation**: aggregate accuracy hides subgroup failures; evaluate performance on meaningful data slices (by class, by demographic, by input length) before shipping.
- **CI should run the overfit-tiny-batch test and shape/gradient tests on every PR** — a full training run is too slow for CI, but these fast sanity checks catch most real regressions.
`,

  debugging: `
### The toolbox, in escalation order

1. **Overfit a tiny batch first.** If the model cannot drive loss near zero on 10-20 examples, the bug is in data loading, labels, loss function wiring, or the optimizer — not in your architecture choice or hyperparameters.
2. **Print/inspect shapes at every layer boundary** — the single most common bug category is a shape mismatch silently broadcasting into something wrong instead of erroring.

~~~python
x = torch.randn(32, 3, 224, 224)
for name, layer in model.named_children():
    x = layer(x)
    print(name, x.shape)     # confirm shapes match expectations at every stage
~~~

3. **Check for NaN/Inf early**, not after hours of wasted training:

~~~python
loss = criterion(model(xb), yb)
if torch.isnan(loss) or torch.isinf(loss):
    raise RuntimeError(f"loss is {loss.item()} -- check learning rate, data, or normalization")
~~~

4. **Watch gradient norms** — a norm that explodes toward infinity or collapses toward zero across layers is a direct read on vanishing/exploding gradients:

~~~python
for name, param in model.named_parameters():
    if param.grad is not None:
        print(name, param.grad.norm().item())
~~~

5. **Visualize loss curves** (train vs. validation) — a training loss that decreases while validation loss increases is overfitting; both flat from step one usually means the learning rate is too low, the data is unshuffled/broken, or gradients are not flowing at all.
6. **torch.autograd.set_detect_anomaly(True)** during debugging (never in production — it is slow) pinpoints the exact operation that produced a NaN gradient.
7. **Reduce to the smallest reproducible case**: fewer layers, fewer samples, CPU instead of GPU, to isolate whether the bug is architectural, numerical, or a hardware/driver issue.

### Debugging distributed training

- "Loss looks fine on one GPU but breaks with DistributedDataParallel" usually means gradients are not being synchronized correctly, or batch norm statistics differ across replicas — check that all-reduce is actually happening (log a gradient checksum across ranks).
- Hangs in distributed training are frequently caused by one rank taking a different code path (e.g. an if statement based on local data that isn't identical across ranks) than the others, deadlocking the collective communication call.
`,

  monitoring: `
Production visibility for deep learning systems spans training-time and serving-time concerns.

### Training-time metrics

~~~python
import torch

def log_training_step(writer, step, loss, model, lr):
    writer.add_scalar("train/loss", loss.item(), step)
    writer.add_scalar("train/learning_rate", lr, step)
    total_norm = 0.0
    for p in model.parameters():
        if p.grad is not None:
            total_norm += p.grad.norm().item() ** 2
    writer.add_scalar("train/grad_norm", total_norm ** 0.5, step)
~~~

Track loss (train and validation), learning rate (especially with a schedule), gradient norm (catches vanishing/exploding early), and GPU utilization/memory (catches data-pipeline bottlenecks). Tools: TensorBoard, Weights and Biases, MLflow.

### Serving-time metrics

- **Latency** (p50/p95/p99) per inference request, and specifically the split between preprocessing, forward pass, and postprocessing — a slow forward pass needs a different fix than a slow preprocessing step.
- **Throughput** (requests/sec, or tokens/sec for generative models) and batch efficiency (are requests being batched well, or is each hitting the accelerator alone).
- **Prediction distribution drift**: monitor the distribution of model outputs (and, where feasible, key input features) over time — a shift often signals data drift in production inputs relative to training data, silently degrading real-world accuracy without any error being thrown.
- **Model version and input schema** tagged on every logged prediction, so a regression can be traced to a specific deployed checkpoint.

### What to alert on

Alert on symptoms users feel (latency SLO breaches, error rate, a sudden change in prediction distribution) rather than only infrastructure causes (GPU utilization); GPU utilization dashboards are for diagnosis, not paging.
`,

  deployment: `
### A production inference service (FastAPI + PyTorch, containerized)

~~~dockerfile
FROM pytorch/pytorch:2.3.0-cuda12.1-cudnn8-runtime
WORKDIR /app
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt
COPY model/ model/
COPY src/ src/
ENV PYTHONUNBUFFERED=1
EXPOSE 8000
# uvicorn workers = 1 per GPU process; scale replicas, not in-process worker count,
# for GPU-bound inference
CMD ["uvicorn", "src.api.main:app", "--host", "0.0.0.0", "--port", "8000"]
~~~

Why each choice matters: the official PyTorch CUDA base image ships matching CUDA/cuDNN versions (a common source of "works on my machine" GPU bugs if hand-rolled); model weights are copied in as a build artifact, not downloaded at request time; a single process per GPU avoids CUDA context contention between workers.

~~~python
# src/api/main.py -- inference-only serving path
import torch
from fastapi import FastAPI

app = FastAPI()
model = torch.jit.load("model/traced_model.pt", map_location="cuda")
model.eval()

@app.post("/predict")
@torch.no_grad()
def predict(payload: dict):
    x = preprocess(payload)              # must match training-time preprocessing exactly
    x = x.to("cuda")
    logits = model(x)
    return postprocess(logits)
~~~

### Serving formats and topology

- **TorchScript / torch.jit.trace or script**: serializes the model graph independent of Python, removing the Python interpreter from the inference hot path.
- **ONNX**: an interchange format that lets a model trained in PyTorch run in other runtimes (ONNX Runtime, TensorRT) often with additional graph-level optimizations and cross-framework portability.
- **TensorRT**: NVIDIA's inference optimizer, applying kernel fusion, precision calibration (fp16/int8), and hardware-specific tuning for lowest-latency GPU inference.
- Health endpoints (/healthz, /readyz) and graceful shutdown apply exactly as in any service (see the **Python** skill's Deployment section); the deep-learning-specific addition is a **model warm-up** request at startup, since the very first inference on a freshly loaded model/GPU is often significantly slower (CUDA kernel compilation/caching) than steady-state requests.
`,

  "production-checklist": `
Before a deep learning model takes real production traffic:

- [ ] Model checkpoint saved in a safe format (safetensors, not raw pickle) with a pinned version tag
- [ ] Preprocessing/postprocessing code verified byte-identical to training-time logic, covered by a regression test
- [ ] Golden-output regression test: fixed input, expected output, run in CI
- [ ] Inference wrapped in torch.no_grad() and model.eval() explicitly set
- [ ] Latency measured end to end (p50/p95/p99) under realistic load, including cold-start/warm-up cost
- [ ] Model size vs. latency/cost budget explicitly checked; quantization/distillation evaluated if over budget
- [ ] Input validation and schema checks before the tensor conversion step (reject malformed input before it reaches the model)
- [ ] Prediction/confidence distribution monitoring wired up to catch data drift
- [ ] Rollback plan: previous model checkpoint kept deployable behind a version flag
- [ ] GPU/accelerator capacity and autoscaling behavior load-tested
- [ ] Rate limiting and authentication on the serving endpoint (see Security)
- [ ] Model provenance documented: training data, code version, hyperparameters, evaluation metrics
- [ ] Slice-based evaluation results reviewed (not just aggregate accuracy) before sign-off
- [ ] Runbook: how to roll back a bad model version, how to read the dashboards, who owns retraining
`,

  "common-mistakes": `
1. **Not overfitting a tiny batch before a full training run** — the fastest sanity check exists precisely to catch pipeline bugs before burning a full compute budget.
2. **Learning rate too high or too low** — the single most common cause of "training doesn't work"; always sanity-check with a learning-rate range test first.
3. **Forgetting to normalize inputs**, or normalizing with different statistics at inference than at training — silently degrades accuracy without an error.
4. **Not shuffling training data** — a DataLoader without shuffle=True can feed batches that are correlated (e.g. all one class in a row), destabilizing training.
5. **Comparing validation loss to training loss without matching batch sizes/dropout state** — remember dropout is active in training mode and off in eval mode; comparing losses across these modes is apples-to-oranges.
6. **Ignoring the vanishing/exploding gradient risk in very deep or recurrent networks** until training visibly fails, instead of using known mitigations (careful init, batch norm, residual connections, gradient clipping) proactively.
7. **Treating batch size purely as a memory constraint** without adjusting the learning rate to match — a naive batch size increase alone often makes results worse, not better.
8. **Training from scratch instead of fine-tuning a pretrained model** when a relevant pretrained model exists — slower, more data-hungry, usually worse.
9. **Reporting a single accuracy number** without slice-based evaluation, hiding subgroup or edge-case failures that matter in production.
10. **Not fixing a random seed during debugging**, making it impossible to tell whether a code change or run-to-run noise caused a metric change.
`,

  "common-errors": `
| Error | Typical cause | Fix |
|-------|---------------|-----|
| Loss is NaN after a few steps | Learning rate too high, unnormalized inputs, or division by zero in a custom loss | Lower learning rate, normalize inputs, add epsilon to denominators, clip gradients |
| Loss never decreases from its initial value | Gradients not flowing (e.g. detached tensor, frozen params by mistake), or learning rate far too low | Check requires_grad on parameters; verify with a gradient-norm print; try a learning-rate range test |
| RuntimeError: size mismatch (matrix multiplication) | Layer output shape does not match the next layer's expected input shape | Print shapes at every layer boundary; check flatten/reshape calls |
| CUDA out of memory | Batch size, model size, or activation memory too large for the GPU | Reduce batch size, use gradient accumulation, enable mixed precision, use gradient checkpointing |
| Model performs well on training data but poorly in production | Train/serving preprocessing mismatch, or data distribution drift | Diff preprocessing code paths; monitor input/prediction distributions in production |
| Validation accuracy far below training accuracy | Overfitting | Add dropout/weight decay/data augmentation, reduce model capacity, or get more data |
| Training is extremely slow, GPU utilization low | Data-loading bottleneck (CPU-bound DataLoader) | Increase num_workers, use pin_memory, prefetch, check disk I/O |
| Different results on every run despite fixed seed | Non-deterministic CUDA/cuDNN operations | Set torch.backends.cudnn.deterministic = True (accepting a speed cost) |
| RuntimeWarning: dropout/batchnorm behaving unexpectedly at inference | Forgot model.eval() before inference | Call model.eval() before inference, model.train() before resuming training |

The habit that matters: when a training run misbehaves, first confirm the pipeline with the tiny-batch overfit test, then check the loss/gradient curves, before touching architecture or hyperparameters.
`,

  faqs: `
**Q: Do I need to understand backpropagation math to use deep learning frameworks?**
You need the intuition (chain rule, gradients flow backward, weights move opposite their gradient) far more than the full derivation. Frameworks like PyTorch compute the math for you via autograd; what you actually debug day to day is data, shapes, learning rate, and loss curves — all of which require the intuition, not the derivation.

**Q: Why does ReLU work better than sigmoid/tanh in most modern networks?**
ReLU's gradient is exactly 1 for positive inputs (no saturation, so gradients don't vanish through many stacked layers) and is nearly free to compute. Sigmoid/tanh saturate (flatten) for large-magnitude inputs, which is where vanishing gradients historically made deep networks with those activations very hard to train.

**Q: Should I train from scratch or fine-tune a pretrained model?**
Fine-tune a relevant pretrained model whenever one exists — it is almost always cheaper, faster, and more accurate, especially with limited labeled data. Training from scratch is reserved for genuinely novel domains with no good pretrained starting point, or research settings studying the architecture itself. See the **Fine-Tuning** skill.

**Q: Adam or SGD?**
Adam (or AdamW) is the sensible default: fast convergence, little tuning required. Well-tuned SGD with momentum can slightly out-generalize Adam on some vision benchmarks, but costs significantly more tuning effort — most teams start with Adam and only investigate SGD if generalization is the bottleneck.

**Q: How much data do I actually need?**
There is no universal number; it depends on task complexity and how much of the work a pretrained model already does for you. Fine-tuning a strong pretrained model can work with hundreds to a few thousand labeled examples for many tasks; training a large architecture from scratch typically needs orders of magnitude more.

**Q: Why does my model overfit even with lots of data?**
Model capacity, training length, and regularization all interact with dataset size — a very large model with too little regularization can still overfit even a fairly large dataset. Watch the train/validation loss gap and apply dropout, weight decay, early stopping, or data augmentation as needed (see Intermediate Concepts).

**Q: CPU or GPU for training?**
GPU (or another accelerator) for essentially any real deep learning training — the parallel matrix-multiply hardware routinely delivers a 10-100x speedup over CPU for these workloads (see Advanced Concepts). CPU is fine only for tiny models, debugging, or CPU-only inference of small, already-optimized models.

**Q: What's the difference between deep learning and machine learning?**
Deep learning is a subfield of machine learning that specifically uses many-layered neural networks and backpropagation for representation learning; classical machine learning (linear/logistic regression, trees, SVMs — see the **Machine Learning** skill) typically relies on hand-engineered or simpler learned features and often needs far less data and compute.
`,

  "interview-questions": `
**Junior/Mid:**

1. *What makes a neural network "deep"?* Multiple stacked hidden layers, each learning increasingly abstract representations of the input, versus a shallow one/two-layer network; depth enables hierarchical feature learning without hand engineering.
2. *Walk through the four steps of training a neural network.* Forward pass (compute prediction) then loss computation (compare to true label) then backward pass (compute gradients via backpropagation/chain rule) then weight update (optimizer nudges weights opposite their gradient, scaled by learning rate).
3. *Why do you need a non-linear activation function?* Without one, stacking linear layers collapses mathematically to a single linear layer — depth would add no representational power.
4. *What's the difference between sigmoid and softmax?* Sigmoid outputs an independent probability per unit (good for binary/multi-label); softmax outputs a probability distribution across classes that sums to 1 (for mutually exclusive multi-class classification).
5. *What is dropout and why does it help?* Randomly zeroing activations during training only; prevents co-adaptation of neurons, approximates an ensemble of subnetworks, reduces overfitting. Disabled at inference (model.eval()).

**Senior:**

6. *Explain vanishing and exploding gradients and how you'd fix each.* Chain-rule multiplication across many layers shrinks (vanishes) or grows (explodes) the gradient signal; fixes: ReLU-family activations, careful (He/Xavier) initialization, batch/layer normalization, residual connections, gradient clipping for exploding gradients specifically.
7. *Why does Adam usually converge faster than plain SGD?* Adam maintains per-parameter adaptive learning rates from running estimates of the first and second moments of the gradient, effectively giving each parameter its own step size and momentum — this smooths out ill-conditioned loss surfaces that plain SGD navigates more slowly.
8. *How would you diagnose a training run where loss goes to NaN?* Check for too-high learning rate, unnormalized/corrupted input data, division-by-zero in a custom loss, and exploding gradients; use torch.autograd.set_detect_anomaly during debugging, and gradient clipping as a guard.
9. *Explain the tradeoff of increasing batch size.* Better hardware utilization and smoother gradient estimates, but usually requires a proportionally higher learning rate (with warmup) to converge equally well, and can generalize slightly worse if not compensated; also linearly increases activation memory.
10. *When would you choose to train from scratch instead of fine-tuning?* When no relevant pretrained model exists, the target domain is dramatically different from any available pretraining data, or you are specifically researching architecture/training dynamics rather than solving a downstream task.
11. *How do residual connections help very deep networks train?* They give the gradient a direct additive path backward that bypasses the learned transformation, so even if that transformation's local gradient is small, the network can still propagate a strong gradient signal to earlier layers — enabling stable training at 100+ layers (ResNet).
12. *Design question: you must serve a large model under a strict 50ms latency budget — what levers do you pull?* Quantization (int8), distillation to a smaller student model, TensorRT/ONNX Runtime graph optimization, dynamic batching, and possibly architecture reduction; discuss the accuracy-latency tradeoff curve and how you'd validate the accuracy cost is acceptable via slice-based evaluation.
`,

  "coding-questions": `
### 1. Implement forward and backward pass for a single linear + ReLU layer, by hand (tests real understanding of backprop)

~~~python
import numpy as np

class LinearReLU:
    """A minimal from-scratch layer: no autograd, gradients computed by hand."""
    def __init__(self, in_dim: int, out_dim: int):
        self.W = np.random.randn(in_dim, out_dim) * np.sqrt(2.0 / in_dim)  # He init
        self.b = np.zeros(out_dim)

    def forward(self, x: np.ndarray) -> np.ndarray:
        self.x = x                          # cache for backward
        self.z = x @ self.W + self.b
        self.out = np.maximum(0, self.z)    # ReLU
        return self.out

    def backward(self, d_out: np.ndarray, lr: float) -> np.ndarray:
        d_relu = d_out * (self.z > 0)                 # ReLU gradient: 1 where z>0, else 0
        d_W = self.x.T @ d_relu                        # dL/dW via chain rule
        d_b = d_relu.sum(axis=0)
        d_x = d_relu @ self.W.T                        # gradient to pass to the previous layer
        self.W -= lr * d_W                              # weight update
        self.b -= lr * d_b
        return d_x

layer = LinearReLU(4, 3)
x = np.random.randn(5, 4)                 # batch of 5
out = layer.forward(x)
grad_from_next_layer = np.random.randn(5, 3)
d_x = layer.backward(grad_from_next_layer, lr=0.01)
~~~

Complexity: O(batch times in_dim times out_dim) per forward/backward, the same as the matrix multiply itself. Follow-up: extend to a second layer and verify gradients numerically (finite differences) — the standard "gradient check" technique.

### 2. Implement softmax and cross-entropy loss with numerical stability

~~~python
import numpy as np

def softmax(logits: np.ndarray) -> np.ndarray:
    # subtract max for numerical stability -- exp(large number) overflows otherwise
    shifted = logits - logits.max(axis=-1, keepdims=True)
    exp = np.exp(shifted)
    return exp / exp.sum(axis=-1, keepdims=True)

def cross_entropy(logits: np.ndarray, labels: np.ndarray) -> float:
    probs = softmax(logits)
    n = logits.shape[0]
    # pick out the predicted probability of the true class for each sample
    correct_probs = probs[np.arange(n), labels]
    return -np.mean(np.log(correct_probs + 1e-12))   # epsilon guards log(0)

logits = np.array([[2.0, 1.0, 0.1], [0.5, 2.5, 0.3]])
labels = np.array([0, 1])
print(cross_entropy(logits, labels))
~~~

Complexity: O(batch times num_classes). Follow-up: they'll ask why we subtract the max before exponentiating (overflow prevention) and why we add epsilon before the log (avoids negative infinity when a predicted probability rounds to exactly 0).

### 3. Early stopping implementation (production-flavored)

~~~python
class EarlyStopper:
    """Stop training when validation loss hasn't improved for patience epochs."""
    def __init__(self, patience: int = 5, min_delta: float = 1e-4):
        self.patience = patience
        self.min_delta = min_delta
        self.best_loss = float("inf")
        self.counter = 0

    def should_stop(self, val_loss: float) -> bool:
        if val_loss < self.best_loss - self.min_delta:
            self.best_loss = val_loss
            self.counter = 0
            return False
        self.counter += 1
        return self.counter >= self.patience

stopper = EarlyStopper(patience=3)
for epoch, val_loss in enumerate([0.9, 0.7, 0.68, 0.685, 0.686, 0.687]):
    if stopper.should_stop(val_loss):
        print(f"stopping at epoch {epoch}")
        break
~~~

Discussion points: why min_delta prevents stopping on noise, how this integrates with checkpoint restoration (restore the best checkpoint, not the last one), and the interaction with learning-rate schedules.
`,

  "hands-on-labs": `
### Lab 1 — Backprop by hand on a tiny network (beginner, ~1.5h)
Implement a 2-layer network (linear + ReLU + linear + softmax) in raw NumPy: forward pass, manual backward pass, and a training loop on a toy dataset (e.g. scikit-learn's make_moons). Verify gradients with finite-difference gradient checking. Deliverable: a script whose loss decreases and whose gradient check passes within a small tolerance. Skills: the entire forward/backward/update loop, viscerally, with no framework hiding the math.

### Lab 2 — PyTorch feedforward classifier on MNIST (beginner-intermediate, ~2h)
Build the training loop from Intermediate Concepts on the MNIST digit dataset. Add dropout and weight decay, plot train vs. validation loss, and demonstrate overfitting by disabling both regularizers and comparing curves. Deliverable: two loss-curve plots (regularized vs. not) with a written explanation of the gap. Skills: full training loop, regularization, loss-curve diagnosis.

### Lab 3 — Diagnose and fix vanishing gradients (intermediate-advanced, ~2h)
Build a deep (15+ layer) plain feedforward network with sigmoid activations and observe training fail or stall. Then apply, one at a time, ReLU activations, He initialization, batch normalization, and residual connections, logging gradient norms per layer at each step. Deliverable: a plot of gradient norm by layer depth for each variant, showing which fixes actually restore gradient flow. Skills: vanishing/exploding gradients, the internal mechanics of every standard mitigation.

### Lab 4 — Fine-tune, quantize, and serve a pretrained model (production, ~4h)
Take a pretrained image classifier (e.g. ResNet18), fine-tune its final layers on a small custom dataset, export with TorchScript or ONNX, apply post-training int8 quantization, and serve it behind a FastAPI endpoint with a golden-output regression test and latency benchmarking (before vs. after quantization). Deliverable: a latency/accuracy comparison table and a working served endpoint. Skills: transfer learning, model compression, production serving — the whole production section, end to end.
`,

  "real-projects": `
Portfolio-grade projects (each maps to skills employers screen for):

1. **Image classifier with full MLOps loop** — Fine-tune a pretrained CNN on a real dataset of your choosing, track experiments (W&B/MLflow), export to ONNX, quantize, and serve via FastAPI with monitoring (prediction distribution, latency). Demonstrates: transfer learning, experiment tracking, model compression, production serving.

2. **From-scratch autograd engine** — Implement a minimal reverse-mode automatic differentiation engine (a "micrograd"-style project): a scalar or small-tensor Value class that records operations and computes gradients via backward(), then build a small MLP on top of it and train it on a toy dataset. Demonstrates: genuine mastery of backpropagation internals — a strong signal in interviews precisely because most candidates only know the framework-level API.

3. **Vanishing-gradient diagnostic tool** — A small library that instruments any PyTorch model to log per-layer gradient norms and activation statistics during training, flagging likely vanishing/exploding gradients automatically, with a recommendation (switch activation, add batch norm, add residual connections). Demonstrates: deep understanding of training dynamics packaged as a reusable engineering tool.

Each project: reproducible from a fixed config and seed, full type hints, tests covering shape/gradient/regression checks, CI via GitHub Actions, README with an architecture diagram and a loss-curve plot. The engineering discipline around the model is what gets senior interviews, not the model alone.
`,

  "case-studies": `
### AlexNet (2012): the moment deep learning became undeniable
Krizhevsky, Sutskever, and Hinton trained a deep CNN on ImageNet using two GPUs, ReLU activations, and dropout, beating the next-best (classical feature-engineering-based) approach by a massive margin. Lesson: the ingredients (GPUs, ReLU, dropout, large labeled data) had all existed individually before; the breakthrough was combining them at sufficient scale to make depth practically trainable, not a single new algorithm.

### ResNet (2015): depth was gradient-limited, not capacity-limited
Before ResNet, simply stacking more plain layers made networks train worse past a certain depth — not from overfitting, but because gradients could no longer propagate cleanly to early layers. He et al.'s residual connections let networks reach 150+ layers and improve monotonically with depth. Lesson: a seemingly small architectural change (an additive skip connection) can remove an entire class of optimization failure, and understanding vanishing gradients explains exactly why it worked.

### Batch normalization and the "internal covariate shift" debate
Ioffe and Szegedy's batch normalization paper (2015) made training deep networks dramatically more stable and allowed much higher learning rates, becoming a near-default layer within a couple of years. Later research questioned the original explanation (internal covariate shift) while confirming the practical benefit (smoother loss landscape) was real regardless. Lesson: an empirically excellent technique can outlive and outperform its original theoretical justification — evaluate techniques by measured results, not just the story behind them.

### Transformers superseding RNNs (2017 onward)
"Attention Is All You Need" replaced RNN/LSTM recurrence with self-attention, removing the sequential gradient path that caused RNNs' characteristic vanishing-gradient-over-time problems and enabling much greater parallelism during training. Lesson: an architecture change that sidesteps a fundamental optimization limitation (rather than patching around it, as LSTMs did for RNNs) can obsolete an entire prior architecture family within a few years — see the **RNNs** and **Transformers** skills for the full comparison.
`,

  comparisons: `
| Dimension | Deep Learning | Classical ML (trees/linear/SVM) | Rule-based systems |
|-----------|---------------|----------------------------------|---------------------|
| Feature engineering | Learned automatically from raw data | Hand-engineered by domain experts | No learning; hand-coded logic |
| Data requirements | Typically large (or a strong pretrained model) | Can work well with small/medium data | None — deterministic by design |
| Compute requirements | High (GPU/accelerator often required) | Low — CPU is usually fine | Negligible |
| Interpretability | Low (large models are hard to inspect) | Moderate-high (trees, linear coefficients) | Fully transparent |
| Best for | Perceptual/unstructured data: images, audio, text | Structured/tabular data, small datasets, need for interpretability | Well-defined, stable, auditable logic |
| Iteration cost | Higher (training time, tuning, infra) | Lower — fast to train and iterate | Lowest — but brittle to new cases |

**How seniors choose**: reach for deep learning when the data is unstructured (images, audio, free text) or when a strong pretrained model already exists to fine-tune; reach for classical ML on structured/tabular data or when interpretability and small-data performance matter more than squeezing out the last few points of accuracy (gradient-boosted trees still frequently beat deep learning on tabular data); reach for rule-based logic when the domain is well-understood, stable, and must be fully auditable. Most production AI systems combine more than one — a deep learning ranker feeding a rule-based business-logic layer is a very common real-world pattern. See the **Machine Learning** skill for the classical-ML side of this comparison in depth.
`,

  "related-technologies": `
- **Neural Networks** — the fundamental building block (a single layer's weights, biases, activation) that this entire page assumes; start there if any beginner-concepts felt shaky.
- **CNNs (Convolutional Neural Networks)** — the architecture family specialized for grid-like data (images), using convolution instead of full dense layers, giving parameter efficiency and translation invariance.
- **RNNs (Recurrent Neural Networks)** — the classic architecture family for sequential data, processing one time step at a time with a hidden state; largely superseded by Transformers for most modern sequence tasks, but foundational to understand.
- **Transformers** — the self-attention-based architecture that superseded RNNs for most sequence and language tasks, and underlies essentially every modern large language model.
- **Attention** — the core mechanism (learning which parts of the input to weight most heavily) that Transformers are built from; worth understanding independently of the full Transformer architecture.
- **Embeddings** — the learned dense vector representations that deep networks produce internally and that downstream systems (search, recommendation, retrieval-augmented generation) consume directly.
- **Vector Search** — the retrieval infrastructure built specifically to search over embeddings at scale, a common companion to any deep-learning-based representation system.
- **Fine-Tuning** — the dominant modern practice of adapting a pretrained deep network to a new task, referenced throughout this page's Advanced Concepts and FAQs.
- **Machine Learning** — the parent field; classical algorithms, evaluation methodology, and the train/validation/test discipline that deep learning inherits and builds on.

On this platform, the natural next pages from here: **Neural Networks** (if any fundamentals need shoring up), then **CNNs** and **RNNs** (classic architecture families), then **Attention**, then **Transformers**, then **Embeddings**, then **Vector Search**, then **Fine-Tuning**.
`,

  "latest-updates": `
This page's knowledge reflects general, well-established deep learning fundamentals as of the author's training data (through early 2025), with the current date noted as 2026. Core mechanics covered here — backpropagation, gradient descent, activation functions, optimizers, regularization, the vanishing/exploding gradient problem — are decades-stable and unlikely to change; treat those as durable.

What moves faster and should be verified with current sources before being treated as authoritative:

- **Specific benchmark numbers** (exact accuracy/throughput figures for particular model versions) age quickly and were not asserted here without hedging.
- **The current state-of-the-art architecture and optimizer choices** for a given domain shift roughly year to year — Adam/AdamW and ReLU/GELU-family activations were the safe, broadly correct defaults as of this writing, but check current literature or the **Transformers** skill's latest-updates section for anything LLM-specific.
- **Hardware**: new accelerator generations (GPUs, and increasingly custom AI chips) regularly change the practical performance/cost tradeoffs described in Performance and Scalability — treat the relative ordering of techniques as more durable than specific speedup multipliers.
- **Training efficiency techniques** (new optimizer variants, more efficient attention mechanisms, mixture-of-experts scaling) are an active research area; what's described here (mixed precision, gradient accumulation, data/model/pipeline parallelism) are the stable, foundational versions of these ideas rather than the latest research frontier.

For anything version-specific or benchmark-specific, verify against current framework documentation (PyTorch release notes) or recent papers rather than relying solely on this page.
`,

  "future-roadmap": `
Deep learning's core training loop (forward pass, loss, backward pass, weight update via gradient descent) has been essentially unchanged since the 1980s and shows no sign of being replaced — it is safe to treat mastering it as a durable, non-depreciating investment.

What is actively evolving, and worth watching:

- **Efficiency over raw scale**: as models have grown enormously, more research effort is going into getting more capability per parameter and per FLOP — quantization, distillation, sparse/mixture-of-experts architectures, and more efficient attention variants are converging toward "do more with less compute" rather than pure scale-up.
- **Architecture convergence around Transformers**: the same self-attention-based backbone now spans language, vision, audio, and multimodal models; understanding Transformers deeply (see that skill) is increasingly a prerequisite for understanding the frontier across domains, not just for language.
- **Training/inference cost as a first-class engineering constraint**: as deep learning moves from research demos to constant production traffic, the production-facing skills on this page (quantization, batching, serving formats, latency budgets) are becoming as career-relevant as the modeling skills themselves.
- **Automated and adaptive training**: techniques that reduce manual hyperparameter tuning (learning-rate-free optimizers, automated architecture/hyperparameter search) continue to mature, though understanding the manual fundamentals (this page) remains necessary to debug them when they misbehave.

Where to bet career time: the fundamentals on this page (gradients, optimization, regularization, production serving tradeoffs) transfer across every architecture and every future model generation — that transferability, not any specific model or framework, is what makes this page's content durable.
`,

  "cheat-sheet": `
~~~text
DEEP LEARNING ESSENTIALS

Training loop (memorize this):
  1. forward pass:  y_hat = model(x)
  2. loss:          L = criterion(y_hat, y)
  3. backward pass: L.backward()          # fills .grad via autograd
  4. update:        optimizer.step(); optimizer.zero_grad()

Activations:
  ReLU(x) = max(0, x)              # default hidden-layer choice, no saturation for x>0
  sigmoid(x) = 1/(1+e^-x)          # (0,1), binary output / gates
  tanh(x)                           # (-1,1), zero-centered sigmoid
  softmax(x)_i = e^xi / sum(e^xj)  # multi-class output distribution

Gradient problem -> fix:
  vanishing/exploding  -> ReLU family, He/Xavier init, batch norm, residual connections,
                          gradient clipping (exploding specifically)

Optimizers:
  SGD + momentum: v = momentum*v - lr*grad; w += v
  Adam: adaptive per-parameter LR from running mean/variance of gradients -- default choice
  Learning rate = most important hyperparameter. Too high -> diverge. Too low -> stuck/slow.

Regularization:
  dropout(p)         -- randomly zero activations at TRAIN time only (model.train()/model.eval())
  weight_decay       -- L2 penalty on weights via optimizer
  early stopping     -- halt when validation loss stops improving
  data augmentation  -- manufacture variety from existing data

PyTorch inference checklist:
  model.eval()
  with torch.no_grad():
      out = model(x)

Batch size tradeoff:
  small  -> noisier gradient, mild regularization, less memory, more updates/epoch
  large  -> smoother gradient, better GPU utilization, needs higher LR (with warmup)

Production compression:
  quantization (int8)   -- ~4x smaller, faster, small accuracy cost
  pruning                -- remove low-contribution weights/neurons
  distillation           -- small student model mimics large teacher

Serving formats: TorchScript, ONNX, TensorRT -- always model.eval() + no_grad()
~~~
`,

  "flash-cards": `
| Question | Answer |
|----------|--------|
| What makes a network "deep"? | Multiple stacked layers that learn a hierarchy of increasingly abstract representations automatically, instead of hand-engineered features. |
| What are the four steps of the training loop? | Forward pass, loss computation, backward pass (backpropagation), weight update. |
| Why is a non-linear activation function necessary? | Without one, any stack of linear layers collapses mathematically into a single linear layer — depth adds no representational power. |
| Why does ReLU dominate modern hidden layers? | Gradient is exactly 1 for positive inputs (no saturation, so gradients don't vanish through depth), and it's cheap to compute. |
| What causes vanishing/exploding gradients? | Chain-rule multiplication of many layers' local gradients; consistently less than 1 shrinks the signal, consistently greater than 1 blows it up. |
| Name three mitigations for vanishing/exploding gradients. | Careful weight initialization (He/Xavier), batch normalization, residual (skip) connections. |
| What does dropout do, and when is it active? | Randomly zeroes activations to prevent co-adaptation of neurons; active only during training, disabled at inference (model.eval()). |
| Why is learning rate the most important hyperparameter? | Too high causes divergence/oscillation; too low causes painfully slow or stuck training — it directly controls the step size of every weight update. |
| SGD with momentum vs. Adam — key difference? | Momentum adds a velocity term in a fixed direction; Adam additionally adapts each parameter's effective learning rate from running gradient statistics. |
| Why do deep networks need GPUs? | Each layer is a large matrix multiplication of independent multiply-adds; GPUs parallelize thousands of these at once, unlike CPUs. |
| Large batch size vs. small batch size — main tradeoff? | Large batches give smoother gradients and better hardware utilization but need a higher learning rate (with warmup); small batches add regularizing noise but use less memory. |
| What is transfer learning / fine-tuning? | Starting from a model pretrained on a large generic dataset and adapting it to a new task, instead of training from random initialization. |
| What does optimizer.zero_grad() do and why is it needed? | Clears accumulated gradients before the next backward() call, since PyTorch accumulates gradients into .grad by default. |
| What is quantization? | Storing weights/activations in lower precision (e.g. int8) to shrink model size and speed up inference, at a small accuracy cost. |
| What replaced RNNs for most sequence tasks, and why? | Transformers, via self-attention — removing the sequential recurrence that caused RNNs' vanishing-gradient-over-time problem and enabling much greater training parallelism. |
`,

  mcqs: `
**1. Why does stacking linear layers without any non-linear activation fail to add representational power?**
A) It doesn't fail — it works fine
B) The composition of linear functions is still linear, mathematically collapsing to one layer
C) Linear layers cannot be trained with backpropagation
D) It causes exploding gradients

Answer: B. A matrix product of linear transformations is itself a single linear transformation, so no amount of depth without non-linearity increases the function class the network can represent.

**2. What is the primary reason ReLU is preferred over sigmoid for hidden layers in deep networks?**
A) ReLU outputs are bounded between 0 and 1
B) ReLU has a constant gradient of 1 for positive inputs, avoiding the saturation that causes vanishing gradients
C) ReLU is only usable with Adam
D) ReLU always produces a probability distribution

Answer: B. Sigmoid saturates (flattens, gradient near 0) for large-magnitude inputs; ReLU's gradient is exactly 1 for any positive input, so it doesn't shrink gradients through many stacked layers.

**3. Which of the following is NOT a standard mitigation for vanishing/exploding gradients?**
A) Batch normalization
B) Residual (skip) connections
C) Careful weight initialization (He/Xavier)
D) Increasing the batch size

Answer: D. Batch size affects gradient noise and hardware utilization, not the layer-by-layer gradient magnitude problem that causes vanishing/exploding gradients; the other three directly address it.

**4. During inference (not training), what two things must you ensure in PyTorch?**
A) optimizer.step() and loss.backward()
B) model.train() and optimizer.zero_grad()
C) model.eval() and torch.no_grad()
D) model.fit() and model.predict()

Answer: C. model.eval() disables dropout and freezes batch-norm running statistics; torch.no_grad() avoids building an unnecessary autograd graph, saving memory and time.

**5. What does increasing batch size typically require to converge equally well?**
A) A lower learning rate
B) No change to learning rate
C) A proportionally higher learning rate, often with warmup
D) Removing all regularization

Answer: C. A larger batch produces a smoother, more accurate gradient estimate per step, but with fewer total updates per epoch; a correspondingly higher learning rate (with a warmup period) is the standard way to keep convergence speed and quality comparable.

**6. Why is fine-tuning a pretrained model usually preferred over training from scratch in production?**
A) It always produces a smaller model
B) It reuses learned representations, typically needing far less data and compute for comparable or better accuracy
C) It removes the need for a loss function
D) It avoids using GPUs entirely

Answer: B. A pretrained model has already learned general-purpose representations from a large dataset; adapting them to a new task is typically cheaper and more data-efficient than learning representations from random initialization.
`,

  "revision-notes": `
Deep learning is machine learning with **stacked layers of differentiable transformations** that learn a hierarchy of representations directly from data, replacing hand-engineered features with learned ones. Every architecture — feedforward, CNN, RNN, Transformer — shares the same training loop: a forward pass produces a prediction, a loss function scores how wrong it is, a backward pass uses the chain rule (backpropagation) to compute how much each weight contributed to that error, and an optimizer nudges every weight opposite its gradient by an amount scaled by the learning rate.

Non-linear activation functions (ReLU dominant in hidden layers; sigmoid for binary outputs/gates; softmax for multi-class outputs) are what make stacking layers meaningful at all — without them, any depth collapses to one linear function. Depth's central engineering challenge is the vanishing/exploding gradient problem, where the chain-rule product of many layers' local gradients shrinks toward zero or grows without bound; the standard toolkit — careful initialization (He/Xavier), batch normalization, and residual/skip connections — exists specifically to keep gradient signal usable across many layers, and is a major reason architectures like ResNet and the Transformer succeeded where naive deep stacks failed.

Optimization in practice means choosing between SGD with momentum (simple, sometimes better final generalization, needs more tuning) and Adam (adaptive per-parameter learning rates, fast and forgiving, the default starting point), with learning rate as the single highest-leverage hyperparameter — too high diverges, too low stalls. Regularization specific to deep nets (dropout, weight decay, early stopping, data augmentation) controls overfitting, which is diagnosed by watching the gap between training and validation loss, not training loss alone.

Production deep learning splits cleanly into a compute-heavy, infrequent training phase (best run on GPUs/accelerators because layers are parallel matrix multiplications) and a latency-sensitive, constant inference phase, where model size, quantization, pruning, and serving format (TorchScript, ONNX, TensorRT) determine whether a model meets its latency and cost budget. The dominant modern practice is transfer learning/fine-tuning a pretrained model rather than training from scratch, since it is almost always cheaper, faster, and more data-efficient (see the **Fine-Tuning** skill).

This page is the hub for the platform's architecture-specific skills: **Neural Networks** (the single-layer building block), **CNNs** and **RNNs** (the classic architecture families), **Transformers** and **Attention** (the architecture that superseded RNNs for most sequence tasks), and **Embeddings**/**Vector Search** (what deep networks produce and how it's searched downstream). Master this page's mechanics first — they don't change across any of those architectures.
`,

  "learning-roadmap": `
### Week 1 — Foundations and the training loop
Read Beginner and Intermediate Concepts closely; work the numeric backprop example by hand; complete Hands-on Lab 1 (backprop by hand in NumPy). Milestone: you can explain, without notes, what happens in each of the four training-loop steps and why a non-linear activation is required.

### Week 2 — PyTorch fluency and regularization
Build and train the full feedforward network from Intermediate Concepts; complete Hands-on Lab 2 (MNIST classifier with dropout/weight decay), deliberately comparing regularized vs. unregularized loss curves. Milestone: you can read a train/validation loss curve and diagnose overfitting vs. underfitting vs. a broken pipeline.

### Week 3 — Internals: gradients, initialization, and optimizers
Study Advanced Concepts and Internal Working in depth; complete Hands-on Lab 3 (diagnosing vanishing gradients across a deep sigmoid network and fixing it layer by layer). Milestone: you can explain vanishing/exploding gradients and defend each of the four standard mitigations with the mechanism behind it, not just the name.

### Week 4 — Transfer learning and production
Read Production Usage, Performance, Deployment, and Security; complete Hands-on Lab 4 (fine-tune, quantize, and serve a pretrained model). Milestone: you can take a pretrained model to a served, load-tested, monitored production endpoint end to end, and explain the size/latency/accuracy tradeoffs you made.

### Where to go next
With this page's mechanics solid, move to the **Neural Networks** skill if any fundamentals still feel shaky, then progress through **CNNs**, then **RNNs**, then **Attention**, then **Transformers**, then **Embeddings**, then **Vector Search** — each of those pages assumes everything on this page and focuses purely on what makes its architecture different.
`,

  "official-docs": `
- **PyTorch documentation** (pytorch.org/docs) — the primary reference for nn.Module, autograd, optimizers, and the training-loop APIs used throughout this page.
- **PyTorch tutorials** (pytorch.org/tutorials) — official, runnable walkthroughs including the "60 minute blitz" and dedicated tutorials on autograd internals, mixed precision, and distributed training.
- **ONNX documentation** (onnx.ai) — the interchange format's specification and framework interoperability guides, relevant to the Deployment section.
- **NVIDIA TensorRT documentation** — inference optimization specifics referenced in Deployment and Performance.
- **JAX documentation** (jax.readthedocs.io) — for the functional-transformation alternative to PyTorch mentioned in Production Usage.

Always cross-check version-specific API details against the current docs — framework APIs (especially mixed precision and compilation APIs) evolve faster than this page's fundamentals-level content.
`,

  books: `
- **"Deep Learning" by Ian Goodfellow, Yoshua Bengio, and Aaron Courville** — the field's most comprehensive textbook; the definitive reference for the mathematical foundations behind everything on this page.
- **"Dive into Deep Learning" by Zhang, Lipton, Li, and Smola** — freely available online, uniquely combines rigorous explanation with runnable code (PyTorch/JAX/TensorFlow) for every concept, an excellent companion while working through this page's code examples.
- **"Deep Learning with PyTorch" by Eli Stevens, Luca Antiga, and Thomas Viehmann** — the best PyTorch-specific book for going from this page's training loop to real, larger projects.
- **"Neural Networks and Deep Learning" by Michael Nielsen** — a free online book with an unusually clear, from-first-principles derivation of backpropagation; excellent if the numeric example in Beginner Concepts left you wanting the full derivation.
- **"Hands-On Machine Learning" by Aurélien Géron** — broader than pure deep learning but has an excellent, practical deep learning section bridging from the classical-ML side (see the **Machine Learning** skill).
`,

  blogs: `
- **Andrej Karpathy's blog and "Neural Networks: Zero to Hero" video series** — exceptionally clear, code-first explanations of backpropagation, autograd internals (his "micrograd" project mirrors Coding Question 1 on this page), and modern architectures.
- **Distill.pub** (archived but still an excellent read) — visual, interactive explanations of deep learning internals, particularly strong on optimization and interpretability topics.
- **The official PyTorch blog** — release notes and deep dives on performance features (torch.compile, mixed precision, distributed training) referenced in Performance and Scalability.
- **Sebastian Ruder's blog** — especially the widely cited overview of gradient descent optimization algorithms, a strong supplement to the Optimizers material in Intermediate Concepts.
- **Lilian Weng's blog (lilianweng.github.io)** — deep, well-cited technical write-ups bridging classic deep learning fundamentals and current architectures.
`,

  "research-papers": `
This is a foundations-heavy topic with a genuinely deep and canonical paper trail — unlike some newer platform skills, there is no need to hedge with "thin coverage" here.

- **Rumelhart, Hinton, Williams (1986), "Learning representations by back-propagating errors"** — the paper that popularized backpropagation for multi-layer networks.
- **Krizhevsky, Sutskever, Hinton (2012), "ImageNet Classification with Deep Convolutional Neural Networks" (AlexNet)** — the paper that ignited the modern deep learning era.
- **Ioffe and Szegedy (2015), "Batch Normalization: Accelerating Deep Network Training by Reducing Internal Covariate Shift"** — the paper introducing batch norm, referenced throughout Advanced Concepts.
- **He et al. (2016), "Deep Residual Learning for Image Recognition" (ResNet)** — introduces residual connections, directly relevant to the vanishing-gradient mitigations in this page.
- **Srivastava et al. (2014), "Dropout: A Simple Way to Prevent Neural Networks from Overfitting"** — the canonical dropout paper.
- **Kingma and Ba (2015), "Adam: A Method for Stochastic Optimization"** — the paper behind the default optimizer discussed in Intermediate Concepts.
- **Vaswani et al. (2017), "Attention Is All You Need"** — the Transformer paper; foundational reading before moving to the **Transformers** and **Attention** skills.

For architecture-specific deep dives (convolutional architectures, recurrent/LSTM papers, attention mechanisms), see the research-papers sections of the **CNNs**, **RNNs**, and **Transformers** skills respectively — this page intentionally covers the cross-architecture foundations only.
`,

  videos: `
- **Andrej Karpathy — "Neural Networks: Zero to Hero" (YouTube series)** — builds backpropagation and a neural network from scratch on screen; the single best video resource for genuinely internalizing this page's Internal Working section.
- **3Blue1Brown — "Neural Networks" series** — outstanding visual intuition for what a neuron, a layer, gradient descent, and backpropagation actually mean geometrically; ideal before or alongside Beginner Concepts.
- **Stanford CS231n lectures (available online)** — the classic computer-vision-flavored deep learning course; strong coverage of optimization, initialization, batch norm, and the practical training advice reflected in this page's Best Practices.
- **Yann LeCun and Geoffrey Hinton's various public lectures and interviews** — valuable for the historical "why" behind design decisions (why CNNs, why backprop was initially doubted) covered in History and Why It Exists.
- **PyTorch official YouTube channel** — release-specific deep dives on training loop APIs, torch.compile, and mixed precision referenced in Production Usage and Performance.
`,

  "github-repos": `
- **pytorch/pytorch** — the framework used throughout this page's code examples; browsing its source for nn.Linear, autograd, and the optimizers is a genuine way to deepen internals understanding.
- **karpathy/micrograd** — a tiny (under 200 lines) autograd engine implementing exactly the backpropagation mechanics from Internal Working; reading and re-implementing this is one of the highest-value exercises for this topic.
- **karpathy/nanoGPT** — minimal, readable training code for a small Transformer, useful once you progress to the **Transformers** skill but built on exactly this page's training loop.
- **pytorch/examples** — official minimal, runnable examples (MNIST, ImageNet training, etc.) matching the style of code in this page's Intermediate Concepts.
- **huggingface/transformers** — the dominant library for using and fine-tuning pretrained models in practice, directly relevant to the Advanced Concepts transfer-learning material.
- **onnx/onnx** — the ONNX format's reference implementation and conversion tooling referenced in Deployment.
- **NVIDIA/TensorRT** — the inference-optimization toolkit referenced in Performance and Deployment.
- **d2l-ai/d2l-en** — the full code and text of "Dive into Deep Learning," runnable alongside the book recommendation above.
`,

  "practice-problems": `
Ordered by the skill area they exercise:

1. **Manual gradient computation** — given a small computational graph (2-3 operations), compute every intermediate gradient by hand, then verify with PyTorch's autograd. Exercises: chain rule fluency (Internal Working).
2. **Gradient checking** — implement finite-difference numerical gradient checking against your hand-written backward pass from Coding Question 1. Exercises: backprop correctness (Internal Working, Testing).
3. **Diagnose a broken training run** — given a script with a deliberately introduced bug (missing zero_grad, forgotten model.eval(), wrong normalization), find and fix it. Exercises: Debugging, Common Errors.
4. **Implement and compare optimizers** — implement plain SGD, SGD with momentum, and a simplified Adam from scratch in NumPy on the same toy problem, and plot their convergence. Exercises: Optimizers (Intermediate/Advanced Concepts).
5. **Regularization ablation** — train the same architecture with and without dropout/weight decay/data augmentation on a small dataset, and quantify the validation-loss difference. Exercises: Regularization, Testing.
6. **Fine-tune vs. train from scratch** — on a small image dataset, compare a fine-tuned pretrained model against an identical architecture trained from random initialization, holding data and epochs constant. Exercises: Transfer Learning (Advanced Concepts).
7. **Quantize and benchmark** — apply post-training int8 quantization to a trained model and measure the size, latency, and accuracy delta. Exercises: Performance, Deployment.

External practice sets: Kaggle's "Learn Deep Learning" micro-courses and competition notebooks; the exercises accompanying "Dive into Deep Learning" (each chapter ships runnable exercises); fast.ai's practical deep learning course assignments.
`,

  "architecture-diagram": `
~~~mermaid
flowchart TB
    subgraph Offline["Offline: training pipeline"]
        RawData["Raw labeled data"] --> Prep["Preprocessing + augmentation"]
        Prep --> Loader["DataLoader (batches, shuffled)"]
        Loader --> FwdBwd["Forward + backward pass on GPU/accelerator (mixed precision, gradient clipping)"]
        FwdBwd --> Opt["Optimizer step (Adam/SGD) + LR schedule"]
        Opt --> Loader
        Opt --> Ckpt["Checkpoints + experiment tracking (loss, LR, grad norm)"]
        Ckpt --> BestModel["Best checkpoint selected by validation metric"]
    end

    subgraph Compress["Model compression"]
        BestModel --> Quant["Quantization / pruning / distillation"]
        Quant --> Export["Export: TorchScript / ONNX / TensorRT"]
    end

    subgraph Online["Online: inference service"]
        Export --> Load["Model loaded once at process startup"]
        Req["Inference request"] --> PrePost["Preprocessing (must match training exactly)"]
        PrePost --> Load
        Load --> Infer["Forward pass only (model.eval(), torch.no_grad())"]
        Infer --> Post["Postprocessing (softmax -> labels, thresholds)"]
        Post --> Resp["Response"]
    end

    Infer --> Mon["Monitoring: latency, throughput, prediction-distribution drift"]
~~~
`,

  "mind-map": `
~~~mermaid
mindmap
  root((Deep Learning))
    Foundations
      Stacked differentiable layers
      Representation learning vs hand-engineered features
      Neural Networks skill as building block
    Core mechanics
      Forward pass
      Loss functions
        Cross-entropy
        MSE
      Backward pass / backpropagation
        Chain rule
        Autograd
      Weight update
        Gradient descent
    Activations
      ReLU
      Sigmoid
      Tanh
      Softmax
    Gradient problems
      Vanishing gradients
      Exploding gradients
      Fixes
        Initialization He Xavier
        Batch normalization
        Residual connections
        Gradient clipping
    Optimization
      SGD plus momentum
      Adam and AdamW
      Learning rate
      LR schedules
    Regularization
      Dropout
      Weight decay
      Early stopping
      Data augmentation
    Hardware
      GPUs and accelerators
      Mixed precision
      Batch size tradeoffs
    Transfer learning
      Pretrained models
      Fine-tuning
      Feature extraction
    Production
      Model compression
        Quantization
        Pruning
        Distillation
      Serving formats
        TorchScript
        ONNX
        TensorRT
      Monitoring and drift
    Architecture families
      CNNs
      RNNs
      Transformers and Attention
      Embeddings and Vector Search
~~~
`,
};

export default deepLearning;
