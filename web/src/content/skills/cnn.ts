import type { SkillContent } from "../types";

/**
 * CNNs (Convolutional Neural Networks) — full 50-section knowledge page.
 * Note: code blocks use ~~~ fences (CommonMark-equivalent to backtick fences)
 * so this file needs no backtick escaping inside the template literals.
 */
const cnn: SkillContent = {
  overview: `
A Convolutional Neural Network (CNN) is a neural network architecture built around the **convolution operation** — a small learnable filter that slides across an input (typically an image) and produces a feature map. Instead of connecting every input pixel to every neuron (as a plain multilayer perceptron does), a CNN shares a small set of weights across all spatial positions, exploiting the fact that images have local structure and that useful patterns (an edge, a curve, a texture) can appear anywhere in the frame.

For an AI engineer, CNNs are the technology that made computer vision practical at scale. Before them, vision systems relied on hand-engineered features (SIFT, HOG, Haar cascades) glued to shallow classifiers. CNNs replaced that entire pipeline with a single trainable system that learns its own features directly from pixels, and did so with dramatically fewer parameters than a fully connected network would need for the same input size. This combination of **parameter sharing** and **local connectivity** is the single most important idea in the whole page.

Key characteristics: translation-equivariant feature detection (a filter that finds an edge in the top-left finds the same edge anywhere else in the image), a hierarchical feature structure built by stacking layers (early layers learn edges and colors, deeper layers learn textures, parts, and eventually whole objects), and a strong inductive bias toward spatial locality that makes CNNs far more sample-efficient than unstructured architectures on image data. CNNs remain the backbone of production computer vision — object detection, medical imaging, OCR, autonomous driving perception stacks, and on-device vision — even as Vision Transformers (see the **Transformers** skill) have become competitive or dominant on some large-scale benchmarks. Understanding CNNs deeply is also the fastest way to understand *why* attention-based vision models work, because both are ultimately answering the same question: how do you build spatial structure into a network cheaply.
`,

  history: `
CNNs did not appear suddenly in 2012 — they are the product of three decades of incremental work connecting biology, mathematics, and increasingly available compute.

The core inspiration is biological: **Hubel and Wiesel's** 1959–1962 experiments on the cat visual cortex showed neurons organized into simple cells (respond to oriented edges in a small receptive field) and complex cells (pool over simple cells for position tolerance) — exactly the conv-then-pool pattern CNNs use today. **Kunihiko Fukushima's Neocognitron** (1980) was the first computational architecture to explicitly implement this layered, locally-connected, pooling design, though it was trained with unsupervised competitive learning, not backpropagation.

| Year | Milestone |
|------|-----------|
| 1959–1962 | Hubel & Wiesel map simple/complex cells in cat visual cortex — the biological blueprint |
| 1980 | Fukushima's Neocognitron — first layered conv + pooling architecture |
| 1989 | Yann LeCun applies backpropagation to a conv net for handwritten ZIP code digits at Bell Labs |
| 1998 | **LeNet-5** (LeCun et al.) — the modern CNN template (conv, pool, conv, pool, FC) reads bank checks in production |
| 2006–2011 | "AI winter" for vision — SVMs and hand-engineered features (SIFT, HOG) dominate; CNNs seen as impractical without GPUs and big data |
| 2009 | ImageNet dataset released (Fei-Fei Li et al.) — 14M+ labeled images, the fuel CNNs needed |
| 2012 | **AlexNet** (Krizhevsky, Sutskever, Hinton) wins ILSVRC by a massive margin using GPUs + ReLU + dropout — the breakthrough moment that restarted deep learning as a field |
| 2014 | **VGGNet** (Simonyan & Zisserman) shows depth from simple, repeated 3x3 convs matters more than clever filter sizes; **GoogLeNet/Inception** introduces multi-scale conv blocks |
| 2015 | **ResNet** (He et al.) introduces residual connections, enabling networks over 100 layers deep and winning ILSVRC 2015 |
| 2017 | **MobileNet / EfficientNet** era — CNNs optimized for mobile and edge inference (depthwise separable convolutions) |
| 2020 | **Vision Transformer (ViT)** (Dosovitskiy et al.) shows a pure attention architecture (no convolutions) can match or beat CNNs on large-scale image classification |
| 2022+ | Hybrid and "modernized" CNNs (ConvNeXt) close much of the gap with ViT by borrowing transformer training recipes, showing the architecture wars are not fully settled |

The historical lesson worth internalizing: CNNs were mathematically and biologically well understood in 1989, but were compute- and data-starved until 2012. The 2012 AlexNet result is as much a story about GPUs and ImageNet as it is about a new algorithm.
`,

  "why-it-exists": `
Before CNNs became practical, image understanding split into two unsatisfying worlds:

- **Hand-engineered feature pipelines**: SIFT, HOG, and Haar-like features extracted by fixed, human-designed math, then fed to a shallow classifier (SVM, boosted trees). This required deep domain expertise per task, generalized poorly to new domains, and had a hard ceiling — the features could not improve with more data.
- **Fully connected networks on raw pixels**: technically possible, but structurally wrong for images (explained fully in Problem It Solves). They ignored the fact that a pixel's neighbors matter far more than a pixel on the opposite side of the image.

CNNs exist to close this gap: give the network the same "local pattern, repeated everywhere" prior that hand-engineered features exploited, but let backpropagation *learn* the actual filters from data instead of a human designing them. The insight, drawn directly from Hubel and Wiesel's biology, is that vision is fundamentally hierarchical and local — you detect edges before you detect eyes, and you detect eyes before you detect faces. A CNN's layer stack is a direct computational analogue of that hierarchy.

The other half of "why now" is data and compute. LeNet worked in 1998 on small, clean, low-resolution digit images. It took ImageNet (millions of labeled natural images) and GPUs (parallel throughput for the millions of multiply-adds a conv layer requires) for the architecture to prove itself on real-world images at AlexNet's scale in 2012.
`,

  "problem-it-solves": `
CNNs solve two very concrete problems that plain multilayer perceptrons (MLPs) have on image data.

**1. Parameter explosion.** A modest 224x224 RGB image has 224 x 224 x 3 = 150,528 input values. A fully connected first layer with just 1,000 hidden units needs over 150 million weights — for one layer, before you've learned anything useful. That is memory-prohibitive and, worse, requires an enormous amount of training data to avoid catastrophic overfitting, because every one of those weights must be estimated independently. A convolutional layer with, say, 64 filters of size 3x3x3 needs only 64 x (3x3x3 + 1) = 1,792 parameters — regardless of image size — because the same small filter is reused (shared) at every spatial location.

**2. No translation invariance.** In an MLP, the weight connecting "pixel (10, 10)" to a hidden unit is entirely separate from the weight connecting "pixel (200, 200)" to that unit. If the network learns to detect a cat's ear in the top-left of training images, it has learned nothing about detecting that same ear if it appears in the bottom-right of a test image — each spatial position must independently relearn every pattern. A convolutional filter, by contrast, is applied identically everywhere; if it learns to detect an edge during training, it detects that edge anywhere in any image, for free. This property is called **translation equivariance** (shift the input, the feature map shifts identically) and, combined with pooling, gives approximate **translation invariance** for classification (shift the input a little, the predicted class doesn't change).

What CNNs deliberately do **not** solve: they do not give a network true rotation or scale invariance out of the box (rotate an object 90 degrees and a vanilla CNN may fail unless it saw rotated examples during training or uses data augmentation), and they do not inherently model long-range global relationships as naturally as attention does (a conv filter's receptive field starts small and only grows by stacking layers — see Receptive Field in Advanced Concepts). Both gaps are exactly why data augmentation and Vision Transformers exist, respectively.
`,

  "learning-objectives": `
By the end of this page you should be able to:

1. Explain precisely why fully connected networks are the wrong architecture for images, with the parameter-count and translation-invariance arguments.
2. Compute the output of a convolution operation by hand, including the effects of stride and padding, on a small numeric example.
3. Describe how stacking convolution and pooling layers builds a hierarchy of features from edges to full objects.
4. Explain the role of max/average pooling in downsampling and approximate translation invariance, and articulate the tradeoffs of each.
5. Name and describe the historical significance of LeNet, AlexNet, VGG, and ResNet, including what specific architectural problem each one solved.
6. Explain the residual connection and why it enabled training networks far deeper than previously possible.
7. Build, train, and evaluate a small CNN image classifier in PyTorch, including a correct data pipeline with augmentation.
8. Compute the receptive field of a layer in a stacked conv network and use it to reason about architecture design.
9. Fine-tune a pretrained ResNet on a custom dataset via transfer learning, and decide when to freeze vs unfreeze layers.
10. Reason about production deployment tradeoffs for vision models: latency, model size vs accuracy, and export formats like ONNX/TensorRT.
`,

  prerequisites: `
- **Required**: comfort with the fundamentals of neural networks — layers, weights, activation functions, backpropagation, gradient descent. See the **Neural Networks** skill on this platform first; this page assumes you already know what a forward pass and a loss function are and will not re-derive backpropagation from scratch.
- **Required**: basic Python and enough linear algebra to read a matrix multiplication (dot products, matrix shapes).
- **Helpful**: familiarity with the **Machine Learning** skill (train/val/test splits, overfitting, regularization) — CNN training uses all of this vocabulary directly.
- **Helpful**: basic PyTorch tensor operations (see the **Deep Learning** skill) make the code examples easier to follow, though every snippet here is commented for a first-time PyTorch reader.

Dependency links: **Neural Networks** (prerequisite) → this page (**CNNs**) → **Vision AI** (the production application space CNNs enable: detection, segmentation, OCR, visual search) and, on the sequence-modeling side, **RNNs** → **Attention** → **Transformers** (including Vision Transformers, which this page compares against).
`,

  "beginner-concepts": `
### Why not just flatten the image and use an MLP?

You *can* — flatten a 28x28 grayscale image into a 784-length vector and feed it to a plain MLP. It even works reasonably on MNIST digits. It breaks down on real photos for the two reasons in Problem It Solves: parameter count explodes with resolution, and the network has no notion that nearby pixels are related or that a pattern seen in one location should be recognized in another. CNNs fix both by using a small, shared, spatially-local filter.

### The convolution operation, visually and mathematically

A convolution slides a small matrix (the **kernel** or **filter**, e.g. 3x3) across the input, and at every position computes a single number: the sum of element-wise products between the kernel and the patch of the input it currently covers. This scalar becomes one entry of the output, called a **feature map**.

~~~text
Input (5x5), Kernel (3x3):

Input:                 Kernel:
1 2 3 0 1              1 0 1
0 1 2 3 0              0 1 0
3 0 1 2 1              1 0 1
1 2 0 1 3
0 1 2 3 1

Top-left 3x3 patch of input:
1 2 3
0 1 2
3 0 1

Element-wise multiply and sum:
(1*1)+(2*0)+(3*1) + (0*0)+(1*1)+(2*0) + (3*1)+(0*0)+(1*1)
= (1+0+3) + (0+1+0) + (3+0+1) = 4 + 1 + 4 = 9

That "9" becomes output[0][0]. Slide the kernel one step right,
repeat, and continue across and down the whole input.
~~~

With a 5x5 input, a 3x3 kernel, stride 1, and no padding, the kernel fits in 3x3 = 9 distinct positions, so the output feature map is 3x3.

### Stride and padding

- **Stride** is how many pixels the kernel moves between applications. Stride 1 produces a dense, nearly full-resolution feature map; stride 2 skips every other position, halving the output size and reducing computation — a common alternative to pooling for downsampling.
- **Padding** adds extra border pixels (usually zeros) around the input so the kernel can be centered on edge pixels too, and so the output size can be controlled. "Valid" padding (no padding) shrinks the output; "same" padding adds just enough border so the output stays the same size as the input (for stride 1).

The general output-size formula for one spatial dimension is:

~~~text
output_size = floor((input_size + 2*padding - kernel_size) / stride) + 1

Example: input=5, kernel=3, stride=1, padding=0
output = floor((5 + 0 - 3) / 1) + 1 = 3   (matches the worked example above)

Example: input=5, kernel=3, stride=1, padding=1 ("same" padding for a 3x3 kernel)
output = floor((5 + 2 - 3) / 1) + 1 = 5   (output size preserved)
~~~

### A convolutional layer in PyTorch

~~~python
import torch
import torch.nn as nn

# in_channels=3 (RGB), out_channels=8 filters, each 3x3, stride 1, same padding
conv = nn.Conv2d(in_channels=3, out_channels=8, kernel_size=3, stride=1, padding=1)

x = torch.randn(1, 3, 32, 32)   # (batch, channels, height, width)
y = conv(x)
print(y.shape)   # torch.Size([1, 8, 32, 32]) — 8 feature maps, spatial size preserved
~~~

Each of the 8 output channels is produced by its own learned 3x3x3 filter (3 because the input has 3 channels — a filter always spans the FULL depth of its input, only sliding across height and width).

### Feature maps and the hierarchy of features

Each filter in a conv layer produces one **feature map** — a 2D grid indicating where in the image that filter's pattern was found (high activation = strong match). Stack many filters per layer, and stack many layers, and something remarkable happens purely from data: the first layer's filters converge to simple edge and color-blob detectors; the second layer combines edges into corners and textures; deeper layers combine textures into object parts (an eye, a wheel); the deepest layers combine parts into whole object concepts (a face, a car). Nobody designs this hierarchy by hand — it emerges from stacking simple local operations and training end-to-end with backpropagation.

### Pooling layers

A pooling layer downsamples a feature map by summarizing small neighborhoods, most commonly with **max pooling** (take the largest value in each 2x2 window) or **average pooling** (take the mean).

~~~python
pool = nn.MaxPool2d(kernel_size=2, stride=2)
x = torch.randn(1, 8, 32, 32)
y = pool(x)
print(y.shape)   # torch.Size([1, 8, 16, 16]) — half the height and width, same channels
~~~

Pooling does two jobs: it reduces the amount of computation and memory needed by later layers (downsampling), and it adds a small amount of local translation invariance — if the strongest edge shifts by one pixel within a 2x2 window, max pooling still reports the same maximum value, so the network's output is less sensitive to tiny shifts.
`,

  "intermediate-concepts": `
### Building a small CNN end to end

A classic CNN classifier alternates conv+activation+pool blocks, then flattens into fully connected layers for the final classification:

~~~python
import torch
import torch.nn as nn

class SmallCNN(nn.Module):
    """A LeNet-style CNN for 32x32 RGB images, 10 classes (e.g. CIFAR-10)."""
    def __init__(self, num_classes: int = 10):
        super().__init__()
        self.features = nn.Sequential(
            nn.Conv2d(3, 32, kernel_size=3, padding=1), nn.ReLU(),
            nn.Conv2d(32, 32, kernel_size=3, padding=1), nn.ReLU(),
            nn.MaxPool2d(2),                                    # 32x32 -> 16x16

            nn.Conv2d(32, 64, kernel_size=3, padding=1), nn.ReLU(),
            nn.Conv2d(64, 64, kernel_size=3, padding=1), nn.ReLU(),
            nn.MaxPool2d(2),                                    # 16x16 -> 8x8
        )
        self.classifier = nn.Sequential(
            nn.Flatten(),
            nn.Linear(64 * 8 * 8, 256), nn.ReLU(), nn.Dropout(0.5),
            nn.Linear(256, num_classes),
        )

    def forward(self, x: torch.Tensor) -> torch.Tensor:
        x = self.features(x)
        return self.classifier(x)
~~~

### A full training loop

~~~python
import torch
import torch.nn as nn
from torch.utils.data import DataLoader

def train_one_epoch(model, loader: DataLoader, optimizer, device: str) -> float:
    model.train()
    criterion = nn.CrossEntropyLoss()
    total_loss = 0.0
    for images, labels in loader:
        images, labels = images.to(device), labels.to(device)
        optimizer.zero_grad()
        logits = model(images)
        loss = criterion(logits, labels)
        loss.backward()
        optimizer.step()
        total_loss += loss.item() * images.size(0)
    return total_loss / len(loader.dataset)

device = "cuda" if torch.cuda.is_available() else "cpu"
model = SmallCNN(num_classes=10).to(device)
optimizer = torch.optim.Adam(model.parameters(), lr=1e-3)
# for epoch in range(20): print(train_one_epoch(model, train_loader, optimizer, device))
~~~

### Batch normalization

Batch norm normalizes each channel's activations across the batch to zero mean and unit variance (then applies a learned scale/shift), placed right after a conv layer and before the activation. It stabilizes training, allows higher learning rates, and acts as a mild regularizer. Nearly every modern CNN (ResNet onward) uses it:

~~~python
nn.Sequential(
    nn.Conv2d(32, 64, kernel_size=3, padding=1),
    nn.BatchNorm2d(64),
    nn.ReLU(),
)
~~~

### Data augmentation for vision

Because CNNs are not naturally invariant to rotation, scale, lighting, or cropping, you teach them that invariance by showing randomly perturbed versions of every training image:

~~~python
import torchvision.transforms as T

train_transform = T.Compose([
    T.RandomResizedCrop(224, scale=(0.8, 1.0)),   # random crop + resize
    T.RandomHorizontalFlip(p=0.5),                # mirror — valid for most natural images
    T.ColorJitter(brightness=0.2, contrast=0.2, saturation=0.2),
    T.ToTensor(),
    T.Normalize(mean=[0.485, 0.456, 0.406],        # ImageNet channel statistics
                std=[0.229, 0.224, 0.225]),
])

# Validation/test transforms must NOT augment — only resize/crop deterministically + normalize
eval_transform = T.Compose([
    T.Resize(256), T.CenterCrop(224), T.ToTensor(),
    T.Normalize(mean=[0.485, 0.456, 0.406], std=[0.229, 0.224, 0.225]),
])
~~~

Augmentation choices must respect the task: horizontal flips are fine for a dog/cat classifier, wrong for reading digits or text (flipped digits change meaning); color jitter is fine for natural photos, risky for medical images where color/intensity carries diagnostic meaning.

### Transfer learning with a pretrained CNN

Training a CNN from scratch on a small custom dataset (a few thousand images) overfits badly. Instead, start from a network pretrained on ImageNet (1.4M images, 1000 classes) — its early and middle layers already encode general-purpose edge, texture, and shape detectors that transfer to almost any vision task.

~~~python
import torch.nn as nn
from torchvision.models import resnet18, ResNet18_Weights

model = resnet18(weights=ResNet18_Weights.IMAGENET1K_V1)

# Freeze the pretrained backbone — only train the new head initially
for param in model.parameters():
    param.requires_grad = False

# Replace the final layer for your own number of classes
num_classes = 5
model.fc = nn.Linear(model.fc.in_features, num_classes)   # fc.weight/bias are trainable by default

# Later: unfreeze the last block(s) and fine-tune with a small learning rate
for param in model.layer4.parameters():
    param.requires_grad = True
~~~

A common two-phase recipe: (1) freeze everything except the new head, train a few epochs so the head adapts to your classes without wrecking the pretrained features; (2) unfreeze the top one or two blocks and fine-tune the whole thing at a much lower learning rate (e.g. 10x smaller) so the pretrained weights shift gently rather than being overwritten.
`,

  "advanced-concepts": `
### Receptive field — the key design concept

The **receptive field** of a unit in a given layer is the region of the original input image that can influence that unit's value. A single 3x3 conv layer gives each output unit a 3x3 receptive field. Stack a second 3x3 conv layer on top, and each of ITS output units looks at a 3x3 window of the first layer's output — but each of those 9 positions itself had a 3x3 view of the input, so the effective receptive field on the original image grows to 5x5. Pooling layers multiply this growth: a 2x2 stride-2 pool doubles the effective receptive field of everything above it.

~~~text
Layer                      Effective receptive field on input
Conv 3x3, stride 1          3x3
+ Conv 3x3, stride 1         5x5
+ MaxPool 2x2, stride 2      10x10 (equivalent, after downsampling)
+ Conv 3x3, stride 1         14x14
~~~

This is why deep stacks of small filters (VGG's insight) can match the receptive field of one large filter (e.g. two stacked 3x3 convs match a single 5x5 conv's receptive field) while using fewer parameters (2 x 9 = 18 weights per channel vs 25) and adding an extra nonlinearity (ReLU) in between, which is strictly more expressive. Designing a network means deciding, layer by layer, how large a receptive field you need before the final layer must "see" the whole relevant object — too small and the network can only reason locally; unnecessarily large costs compute and parameters for no benefit.

### Classic architectures and what each one specifically solved

- **LeNet-5 (1998)**: established the conv → pool → conv → pool → fully-connected template still used today, on 32x32 grayscale digits.
- **AlexNet (2012)**: scaled the LeNet template to real photographs and GPUs. Its specific contributions: ReLU instead of tanh/sigmoid (much faster convergence, no vanishing gradient at large activations), dropout to fight overfitting in the huge fully connected layers, and data augmentation — plus splitting the network across two GPUs out of hardware necessity. It won ILSVRC 2012 by roughly 10 percentage points of top-5 error over the next best (non-deep) approach, which is the moment that convinced the field deep learning was not a dead end.
- **VGGNet (2014)**: showed that depth achieved with small, uniform 3x3 filters (rather than AlexNet's mixed large filters) is what drives accuracy, and that stacking small filters is more parameter-efficient than using large ones directly, thanks to the receptive-field math above. The cost: VGG16/19 are parameter-heavy (mostly in the fully connected layers) and slow.
- **GoogLeNet / Inception (2014)**: introduced the "Inception module" — running several filter sizes (1x1, 3x3, 5x5) in parallel within one block and concatenating the results, letting the network choose its own effective receptive field per layer, with 1x1 convolutions used to cheaply reduce channel depth before expensive larger convolutions.
- **ResNet (2015)**: solved a very specific, previously mysterious problem — beyond roughly 20 to 30 layers, plain stacked CNNs got *worse* on both training AND test accuracy, not from overfitting but because gradients struggled to propagate through so many stacked nonlinear transforms (degradation problem). ResNet's fix is the **residual connection**: instead of a block learning a direct mapping H(x), it learns a residual F(x) = H(x) - x and outputs F(x) + x, implemented literally as an addition of the block's input to its output. If the optimal transformation is close to identity, the network only needs to push F(x) toward zero — trivially easy — rather than learn a full identity mapping through several nonlinear layers. This one change enabled training networks with 50, 101, even 152+ layers, and residual connections have since become a standard building block far beyond vision (they are also inside every Transformer block — see the **Transformers** skill).

~~~python
import torch.nn as nn

class ResidualBlock(nn.Module):
    """The core ResNet idea: learn a residual F(x), output F(x) + x."""
    def __init__(self, channels: int):
        super().__init__()
        self.conv1 = nn.Conv2d(channels, channels, 3, padding=1, bias=False)
        self.bn1 = nn.BatchNorm2d(channels)
        self.conv2 = nn.Conv2d(channels, channels, 3, padding=1, bias=False)
        self.bn2 = nn.BatchNorm2d(channels)
        self.relu = nn.ReLU(inplace=True)

    def forward(self, x):
        identity = x
        out = self.relu(self.bn1(self.conv1(x)))
        out = self.bn2(self.conv2(out))
        out = out + identity              # the residual (skip) connection
        return self.relu(out)
~~~

### An honest note on Vision Transformers

Since 2020, **Vision Transformers (ViT)** — which split an image into patches, embed each patch as a token, and apply the same self-attention mechanism used in language models (see the **Attention** and **Transformers** skills), with no convolution at all — have matched or exceeded CNN accuracy on large-scale image classification, given enough pretraining data. ViTs lack the convolution's built-in locality bias, which historically made them need more data or more careful training recipes to reach CNN-level performance from scratch; hybrid and heavily-tuned pure CNNs (ConvNeXt) have since narrowed or closed that gap again in several benchmarks. The honest, current state (subject to this page's knowledge cutoff — verify with recent leaderboards): CNNs remain extremely strong, more compute-efficient, and easier to deploy on edge devices, and are still the default choice for most production vision systems with moderate data and latency budgets; ViTs and hybrid architectures increasingly win at the largest scale and in multimodal settings where the same attention mechanism can also process text. Neither has fully displaced the other — know both.

### 1x1 convolutions and depthwise separable convolutions

A 1x1 convolution does not look at neighboring pixels at all — it only mixes information ACROSS channels at a single position, functioning like a small per-pixel fully connected layer. It is used constantly to cheaply change channel depth (bottleneck layers in ResNet, dimensionality reduction in Inception) without touching the spatial dimensions. **Depthwise separable convolutions** (MobileNet) split a standard convolution into a depthwise step (one filter per channel, spatial only) followed by a 1x1 pointwise step (channel mixing only) — this factorization cuts computation roughly 8–9x for typical filter sizes with only a small accuracy cost, which is why it dominates mobile and edge vision models.
`,

  "internal-working": `
Here is what actually happens, step by step, when an image passes through a trained CNN classifier:

~~~mermaid
flowchart LR
    A["Input image\n(H x W x 3)"] --> B["Conv layer:\nslide K filters,\ndot-product each patch"]
    B --> C["Add bias, apply\nnonlinearity (ReLU)"]
    C --> D["Feature maps\n(H' x W' x K)"]
    D --> E["Pooling:\nmax/avg over\nsmall windows"]
    E --> F["Downsampled\nfeature maps"]
    F -->|repeat conv+pool blocks| B
    F --> G["Flatten / Global\nAverage Pool"]
    G --> H["Fully connected\nlayer(s)"]
    H --> I["Softmax over\nclass logits"]
    I --> J["Backprop: compute\ngradient of loss\nw.r.t. every filter"]
    J -->|update weights| B
~~~

1. **Convolution as a dot product**: at every spatial position, the filter (a small tensor of learnable weights) is overlaid on the input patch of matching depth, an element-wise product is computed and summed, and a learned bias is added. This single scalar becomes one entry of the output feature map. Doing this at every position is mathematically equivalent to (and, in most fast implementations, literally executed as) a big matrix multiplication via the "im2col" trick: overlapping patches of the input are unrolled into columns of a matrix, so the whole convolution becomes one GEMM (general matrix multiply) call that GPUs are extremely fast at.
2. **Nonlinearity**: ReLU (max(0, x)) is applied element-wise to every feature map value. Without this step, stacking conv layers would collapse mathematically into one single linear operation, no matter how many layers you stack — nonlinearity is what allows the hierarchy of features to actually represent increasingly abstract concepts.
3. **Pooling**: within each small window (e.g. 2x2), take the max (or average) — this both shrinks the spatial size and adds local shift-tolerance, as covered in Beginner Concepts.
4. **Repetition**: conv → nonlinearity → (occasionally) pool repeats for many blocks, each time the spatial size shrinks and the channel depth typically grows, so the network trades spatial resolution for a richer, more abstract feature representation.
5. **Head**: after the last conv block, either the feature maps are flattened into one long vector or reduced with **global average pooling** (average every channel's whole feature map down to one number — far fewer parameters than flattening) and fed into one or more fully connected layers ending in a softmax over class scores.
6. **Backpropagation**: the loss (typically cross-entropy for classification) is computed against the true label, and its gradient flows backward through every layer. Crucially, because the SAME filter weights were used at every spatial position during the forward pass, their gradients from every position are summed together during the backward pass — this is exactly how weight sharing lets a single filter learn from thousands of patches within a single image, not just from one.
`,

  architecture: `
Thinking about CNNs at the system level means separating the **model architecture** (how layers connect inside the network) from the **application architecture** (how a vision system is structured around the model in production).

### Model architecture — the canonical CNN stack

~~~mermaid
flowchart TB
    Input["Input image (H x W x 3)"] --> Stem["Stem: conv + pool\n(large early receptive field)"]
    Stem --> Stage1["Stage 1: conv blocks\n(channels: 64, spatial: large)"]
    Stage1 --> Stage2["Stage 2: conv blocks\n(channels: 128, spatial: smaller)"]
    Stage2 --> Stage3["Stage 3: conv blocks\n(channels: 256, spatial: smaller still)"]
    Stage3 --> Stage4["Stage 4: conv blocks\n(channels: 512+, spatial: smallest)"]
    Stage4 --> GAP["Global average pool"]
    GAP --> Head["FC head + softmax\n(task-specific: classify,\ndetect, segment)"]
~~~

The consistent pattern across LeNet, VGG, ResNet, and modern mobile nets: spatial resolution shrinks monotonically stage by stage while channel depth grows, so total compute per stage stays roughly balanced, and the network trades "where" for "what" as depth increases. Modern architectures swap the plain conv blocks in each stage for residual blocks (ResNet), inception blocks (GoogLeNet), or depthwise-separable blocks (MobileNet), but the overall stem → stages → head shape is remarkably stable.

### Application architecture — a production vision service

~~~text
vision-service/
├── pyproject.toml
├── src/vision_service/
│   ├── api/                 # FastAPI routes: /predict, /health
│   ├── inference/           # model loading, preprocessing, postprocessing
│   │   ├── preprocess.py    # resize/normalize — MUST match training exactly
│   │   ├── model.py         # ONNX/TensorRT runtime wrapper
│   │   └── postprocess.py   # softmax -> labels, thresholds, NMS for detection
│   ├── training/             # separate from serving: data loaders, train loop, augmentation
│   ├── evaluation/           # offline metrics, confusion matrices, slice analysis
│   └── core/                 # config, logging
└── models/                   # versioned exported weights (ONNX), not committed to git
~~~

The most consequential architectural rule in production vision systems: the exact preprocessing used at inference (resize method, normalization mean/std, color channel order RGB vs BGR) MUST match training byte-for-byte. Silent preprocessing mismatches are the single most common cause of "the model works in the notebook but is garbage in production."
`,

  "data-flow": `
Tracing one image through a training step and then through a production inference request:

~~~mermaid
sequenceDiagram
    participant Img as Raw image
    participant Pre as Preprocessing
    participant Conv as Conv/Pool stack
    participant FC as FC head
    participant Loss as Loss + optimizer

    Img->>Pre: decode, resize, augment (train only), normalize
    Pre->>Conv: tensor (batch, 3, H, W)
    Conv->>Conv: conv -> ReLU -> pool, repeated per stage
    Conv->>FC: flattened / global-avg-pooled features
    FC->>FC: linear layers -> logits
    FC-->>Loss: logits vs true label
    Loss-->>Conv: backprop gradients, update filter weights
~~~

~~~mermaid
flowchart LR
    Client["Client uploads image"] --> API["API receives bytes"]
    API --> Decode["Decode + resize + normalize\n(same stats as training)"]
    Decode --> Model["Forward pass through\nconv/pool/FC layers\n(ONNX/TensorRT runtime)"]
    Model --> Post["Softmax -> top-K labels\n+ confidence scores"]
    Post --> Response["JSON response\nto client"]
~~~

The training flow and the inference flow share the preprocessing and forward-pass logic but diverge sharply after that: training also runs a backward pass and an optimizer step and uses randomized augmentation, while inference is a single deterministic forward pass with augmentation disabled (only the deterministic resize/crop/normalize survive into serving) and typically runs through an export format (ONNX/TensorRT) rather than the raw PyTorch module, for speed.
`,

  "production-usage": `
### Framework and tooling

PyTorch (with torchvision for models, transforms, and datasets) is the dominant framework for CNN research and production training today; TensorFlow/Keras remains common in some enterprise and mobile deployment stacks (TensorFlow Lite). A typical production CNN project layout:

~~~bash
uv add torch torchvision pillow numpy
uv add --dev pytest ruff
# Training entrypoint
uv run python -m vision_service.training.train --config configs/resnet18_finetune.yaml
~~~

### Standard training configuration defaults

- **Optimizer**: Adam or AdamW for fine-tuning (fast, forgiving of learning-rate choice); SGD with momentum for training large CNNs from scratch at scale (often generalizes slightly better, but needs careful LR scheduling).
- **Learning rate schedule**: cosine annealing or step decay; warmup for the first few epochs when fine-tuning is common practice.
- **Batch size**: as large as GPU memory allows, tuned alongside learning rate (larger batch often needs a proportionally larger LR).
- **Mixed precision (fp16/bf16)** training via torch.cuda.amp — roughly 2x throughput and memory savings on modern GPUs, essentially free accuracy-wise.
- **Checkpointing**: save the model state dict, optimizer state, and epoch number every N steps; keep the best-validation-accuracy checkpoint separately from the latest.

### Data pipeline defaults

- Use torchvision.datasets.ImageFolder or a custom Dataset with a DataLoader using num_workers greater than zero and pin_memory=True on GPU machines, so image decoding/augmentation on CPU overlaps with GPU compute.
- Always hold out a validation set with augmentation DISABLED to get an honest accuracy signal during training.
- Version your dataset and preprocessing code together — a changed resize algorithm silently changes what the model learned.
`,

  "industry-examples": `
- **Tesla / Waymo / autonomous driving perception stacks**: CNN-based (and increasingly CNN+transformer hybrid) backbones process camera feeds in real time to detect lanes, vehicles, pedestrians, and signage — latency and reliability are safety-critical, so heavily optimized, quantized CNNs run on dedicated inference hardware in the vehicle.
- **Google Photos / Meta**: CNN-based image classification and face/object detection power search-by-content, automatic tagging, and content moderation across billions of uploaded images.
- **Radiology and medical imaging (e.g. products built on architectures from PathAI, Aidoc, and academic hospital systems)**: CNNs trained on X-rays, CT, and MRI scans assist in detecting tumors, fractures, and other findings, often as a second-reader system alongside radiologists rather than a fully autonomous decision-maker.
- **Pinterest / Amazon / e-commerce visual search**: CNN embeddings (a pretrained CNN's penultimate-layer feature vector) power "shop this look" and visually-similar-product search — nearest-neighbor search over CNN feature embeddings (see the **Vector Search** skill for the retrieval side of this pipeline).
- **Manufacturing quality control (many industrial vision vendors)**: CNNs inspect products on assembly lines for defects at speeds and consistency no human inspector can match, typically running on edge devices next to the line for millisecond-level latency.
- **Snap / Instagram AR filters**: lightweight CNNs run face and landmark detection directly on-device (phone hardware) in real time, which is exactly the regime MobileNet-style depthwise-separable architectures were built for.

The pattern across all of these: production vision systems are rarely "just a CNN" — they combine a CNN backbone with task-specific heads (detection boxes, segmentation masks, embeddings) and heavy attention to latency and deployment constraints.
`,

  "best-practices": `
1. **Always start from a pretrained backbone** unless you have a genuinely huge, task-specific dataset — training from random initialization wastes data and compute that transfer learning gets you for free.
2. **Match training and inference preprocessing exactly** — same resize algorithm, same normalization constants, same channel order. Mismatches are silent and devastating.
3. **Use batch normalization (or a modern alternative) in every conv block** unless you have a specific reason not to (e.g. very small batch sizes, where group norm is a better fit).
4. **Augment for the invariances your task actually needs** — horizontal flips for natural photos, not for text/digit recognition; be conservative with color jitter on medical or measurement-sensitive imagery.
5. **Validate with augmentation disabled** — a validation number computed on augmented images is not an honest measure of generalization.
6. **Prefer many small filters (3x3) over few large ones**, following the VGG/receptive-field lesson: more nonlinearity and fewer parameters for the same effective receptive field.
7. **Use global average pooling instead of flattening + huge FC layers** where possible — cuts parameters dramatically and reduces overfitting risk in the head.
8. **Freeze then gradually unfreeze during fine-tuning** — protect pretrained weights early, then adapt deeper layers at a low learning rate once the new head has stabilized.
9. **Profile before optimizing**: know whether your bottleneck is data loading, the GPU forward pass, or postprocessing before reaching for a smaller model or quantization.
10. **Version datasets, augmentation code, and preprocessing together with the model weights** — reproducibility for vision models depends on all three matching.
11. **Track per-class and per-slice metrics, not just overall accuracy** — a 95% accurate model can be a 40%-accurate disaster on one important subgroup (rare class, particular lighting, particular skin tone in vision-for-people applications).
12. **Export to ONNX (or TensorRT) for production serving** rather than shipping raw PyTorch training code — smaller runtime footprint, faster inference, and no dependency on the full training framework.
`,

  "anti-patterns": `
### Mismatched preprocessing between training and serving

~~~python
# WRONG — inference uses different normalization stats than training
def preprocess_bad(image):
    tensor = to_tensor(image)
    return tensor / 255.0                     # training used ImageNet mean/std, not just /255

# RIGHT — reuse the exact training transform, deterministic parts only
from torchvision import transforms as T
eval_transform = T.Compose([
    T.Resize(256), T.CenterCrop(224), T.ToTensor(),
    T.Normalize(mean=[0.485, 0.456, 0.406], std=[0.229, 0.224, 0.225]),
])
~~~

### Other common anti-patterns

- **Training from scratch on a tiny dataset** — a few thousand images and a randomly initialized ResNet will overfit hard; use transfer learning instead.
- **Augmenting the validation/test set** — inflates or randomizes your accuracy signal; only the training loader should apply random augmentation.
- **Flattening huge feature maps into a giant FC layer** (VGG's actual weakness) — most of VGG's 138M parameters live in its FC layers; global average pooling avoids this entirely with negligible accuracy cost.
- **Ignoring class imbalance** — a defect-detection dataset that is 99% "no defect" will train a model that always predicts "no defect" and looks 99% accurate while being useless; use weighted loss or resampling.
- **Testing at a different resolution than training without adjustment** — CNN accuracy is sensitive to train/test resolution mismatch (a well-documented effect); if you must change resolution, fine-tune briefly at the new resolution.
- **Using accuracy alone for imbalanced or safety-critical tasks** — track precision/recall/F1 and confusion matrices, especially for medical or security applications.
- **Freezing everything forever** — under-adapts the model to your specific domain; some unfreezing and fine-tuning is usually worth the extra training time once the head has stabilized.
`,

  performance: `
### Measure first

~~~python
import torch, time

model.eval()
with torch.no_grad():
    # warmup
    for _ in range(10):
        model(dummy_input)
    torch.cuda.synchronize()
    start = time.perf_counter()
    for _ in range(100):
        model(dummy_input)
    torch.cuda.synchronize()
    print(f"{(time.perf_counter() - start) / 100 * 1000:.2f} ms/inference")
~~~

Use torch.profiler (or NVIDIA Nsight Systems on GPU) to see where time actually goes — data loading, specific conv layers, or postprocessing — before optimizing blindly.

### The optimization hierarchy (apply in order)

1. **Use a pretrained model + transfer learning** instead of training from scratch — far fewer epochs to reach target accuracy.
2. **Right-size the architecture for the task** — a MobileNet or ResNet-18 for a simple binary classifier is often as accurate as a ResNet-152 and 5–10x faster; bigger is not automatically better in production.
3. **Mixed precision (fp16/bf16)** training and inference — roughly 2x throughput on modern GPUs with negligible accuracy loss.
4. **Batch inference where latency budget allows** — GPUs are throughput machines; batching amortizes kernel launch overhead.
5. **Quantization (int8)** for edge/mobile deployment — typically 2–4x smaller and faster with a small, often acceptable, accuracy drop; always validate the drop on your own eval set.
6. **Export to ONNX Runtime or TensorRT** rather than serving raw PyTorch — TensorRT specifically fuses layers and picks optimized GPU kernels, often 2–5x faster than eager PyTorch for the same model.
7. **Overlap data loading with compute**: DataLoader with multiple workers and pinned memory so the GPU is never waiting on CPU-side image decode/augmentation.

### Numbers worth knowing (order of magnitude, verify for your hardware/model)

- A ResNet-50 forward pass at 224x224 on a modern datacenter GPU is typically low single-digit milliseconds when batched; on CPU it can be tens to hundreds of milliseconds — this gap is why real-time vision almost always needs a GPU or a specialized accelerator (NPU, TPU) at the edge.
- Model size vs accuracy is a genuine curve, not a free lunch: MobileNet-class models trade a few points of ImageNet top-1 accuracy for roughly an order of magnitude fewer parameters and FLOPs versus a full ResNet — the right point on that curve is a product decision, not a purely technical one.
`,

  scalability: `
CNN training and inference scale differently, and production systems need to reason about both.

### Training at scale

~~~mermaid
flowchart LR
    Data["Sharded dataset\n(cloud storage)"] --> W1["GPU worker 1\n(data parallel)"]
    Data --> W2["GPU worker 2"]
    Data --> W3["GPU worker N"]
    W1 & W2 & W3 -->|gradient all-reduce| Sync["Synchronized weight update"]
    Sync --> Ckpt["Checkpoint store"]
~~~

- **Data parallelism** (each GPU holds a full copy of the model, processes a different batch shard, gradients are averaged) is the standard approach for CNNs — they're small enough (tens to hundreds of millions of parameters) that model parallelism is rarely necessary, unlike large language models.
- Multi-GPU/multi-node training uses PyTorch DistributedDataParallel; linear scaling (2x GPUs, roughly 2x throughput) holds up well for CNNs because gradient communication volume is modest relative to compute per step.

### Inference at scale

- **Horizontal scaling**: stateless inference servers behind a load balancer, autoscaled on request rate or GPU utilization — the standard pattern (see the Kubernetes and Load Balancers skills).
- **Batching at the server**: dynamic request batching (accumulate requests for a few milliseconds, run one batched forward pass) dramatically improves GPU utilization for high-traffic inference services, at the cost of a small added latency per request.
- **Edge/on-device**: no horizontal scaling at all — the model must fit the latency and power budget of a single device, which is the entire reason quantization and lightweight architectures (MobileNet, EfficientNet) exist.

### Known bottlenecks and answers

| Bottleneck | Answer |
|------------|--------|
| CPU-bound data loading during training | More DataLoader workers, pinned memory, pre-resize/cache images to disk |
| GPU underutilized at low request volume | Dynamic batching, or fall back to CPU/smaller model for low-traffic periods |
| Model too large for edge device | Quantization, pruning, knowledge distillation into a smaller student network |
| Multi-GPU training gradient sync overhead | Larger per-GPU batch size, gradient accumulation, faster interconnect (NVLink) |
`,

  security: `
### Vision-specific attack surface

1. **Adversarial examples**: small, often imperceptible pixel perturbations can flip a CNN's prediction with high confidence — a well-documented and still-unsolved robustness gap. High-stakes vision systems (security, autonomous driving) need adversarial robustness testing, not just clean-data accuracy.
2. **Data poisoning**: if training data is collected from untrusted or public sources, an attacker can inject mislabeled or crafted images to bias the model — validate data provenance and monitor for anomalous training-set statistics.
3. **Model inversion / membership inference**: a deployed model's outputs (especially confidence scores) can leak information about whether a specific image was in the training set, which matters for privacy-sensitive vision applications (medical, biometric).
4. **Unsafe deserialization of model files**: the same pickle danger covered generally on this platform applies directly — never torch.load an untrusted checkpoint without care; prefer safetensors-format weights where available, and only load model files from sources you trust.
5. **Input validation on uploaded images**: image decoding libraries have historically had memory-safety vulnerabilities (buffer overflows in old JPEG/PNG decoders); keep decoding libraries patched, and set hard limits on image dimensions/file size before decoding to avoid decompression-bomb style resource exhaustion.

### Defenses

- Validate and clamp input image size/format server-side before it ever reaches the model.
- Rate-limit and authenticate the inference API like any other production endpoint (see the **OWASP Top 10** and **Secrets Management** skills).
- For safety-critical vision, combine model confidence thresholds with a human-in-the-loop review path rather than fully autonomous action on low-confidence predictions.
- Monitor prediction distribution drift in production — a sudden shift can indicate either a data pipeline bug or an adversarial/poisoning attempt.
`,

  testing: `
Testing a CNN system spans unit tests on code and statistical evaluation on the model itself — both are required.

~~~python
# tests/test_model.py
import torch
import pytest
from vision_service.inference.model import SmallCNN

def test_output_shape():
    model = SmallCNN(num_classes=10)
    x = torch.randn(4, 3, 32, 32)             # batch of 4
    logits = model(x)
    assert logits.shape == (4, 10)

def test_preprocessing_matches_training_stats():
    from vision_service.inference.preprocess import eval_transform
    # a known-constant image should normalize to the expected range
    img = torch.ones(3, 224, 224)
    normalized = eval_transform(img)
    assert normalized.min() > -3 and normalized.max() < 3   # sane normalized range

@pytest.mark.parametrize("batch_size", [1, 8, 32])
def test_handles_various_batch_sizes(batch_size):
    model = SmallCNN(num_classes=10)
    x = torch.randn(batch_size, 3, 32, 32)
    assert model(x).shape[0] == batch_size
~~~

### The senior testing doctrine for vision models

- **Unit test the pipeline code** (shapes, preprocessing determinism, output ranges) like any software.
- **Hold out a true test set the model never influenced**, and report accuracy, precision/recall, and confusion matrices on it — not just training/validation loss curves.
- **Slice your evaluation**: accuracy by class, by lighting condition, by source/device if metadata exists — an aggregate number hides subgroup failures.
- **Regression-test on a fixed "golden set"** of known tricky images every time the model or preprocessing changes, so silent accuracy regressions are caught before deployment.
- **Test the exported artifact, not just the training-time model** — run the same eval set through the ONNX/TensorRT export and confirm accuracy matches the PyTorch original within a small tolerance; export bugs are common and silent.
`,

  debugging: `
### Escalation path

1. **Check shapes first.** The overwhelming majority of CNN bugs are shape mismatches — print tensor.shape after every layer during development, or run a single forward pass with print statements before writing the training loop.
2. **Overfit a tiny batch on purpose.** Take 5–10 training images, train for many epochs, and confirm the model can drive loss near zero. If it can't, the bug is in the model or loss, not the data or hyperparameters.
3. **Visualize inputs right before they hit the model.** Plot a batch of augmented training images — a shockingly common bug is a broken augmentation pipeline (wrong normalization order, channels swapped) that is invisible in code but obvious in a picture.
4. **Visualize feature maps and filters.** Plotting the first conv layer's learned filters (they should look like edge/color detectors, not noise) or the activation of a middle layer on a sample image is a fast sanity check that the network is learning something structured.
5. **Check the loss curve shape.** Loss that never decreases points at a learning-rate or data-labeling bug; loss that decreases on train but not validation points at overfitting or a train/val distribution mismatch; loss that explodes to NaN points at too-high a learning rate or unnormalized inputs.
6. **Confirm train/eval mode.** A shockingly common bug: forgetting model.eval() during evaluation leaves BatchNorm and Dropout in training mode, producing inconsistent, seemingly random validation results.

~~~python
# Quick feature-map/filter visualization
import matplotlib.pyplot as plt

first_conv_weights = model.features[0].weight.detach().cpu()   # (out_ch, in_ch, k, k)
fig, axes = plt.subplots(4, 8, figsize=(12, 6))
for i, ax in enumerate(axes.flat):
    ax.imshow(first_conv_weights[i].mean(dim=0), cmap="gray")   # average over input channels
    ax.axis("off")
~~~
`,

  monitoring: `
Production vision models need monitoring at three levels: the service, the model's predictions, and the underlying data distribution.

### Service-level metrics (standard, framework-agnostic)

~~~python
from prometheus_client import Counter, Histogram

INFERENCE_REQUESTS = Counter("vision_inference_requests_total", "Requests", ["status"])
INFERENCE_LATENCY = Histogram("vision_inference_seconds", "Inference latency")

@INFERENCE_LATENCY.time()
def predict(image_bytes: bytes) -> dict:
    ...
~~~

Track the standard RED trio (Rate, Errors, Duration) per endpoint, exactly as for any service.

### Model-quality metrics

- **Prediction confidence distribution over time** — a sudden shift toward low-confidence predictions often signals input distribution drift (new camera hardware, new lighting conditions, a changed upstream preprocessing step).
- **Class distribution of predictions** — if a defect-detection model that historically flags 2% of items suddenly flags 20%, investigate before trusting the number; it may be a real production issue or a broken pipeline.
- **Periodic sampled human review**: route a small percentage of production predictions (especially low-confidence ones) to human review and compare against the model's output — the only reliable way to catch silent accuracy decay without waiting for a downstream complaint.

### Data drift

Compare summary statistics (pixel intensity histograms, image size/aspect ratio distribution) of live production traffic against the training distribution periodically; a significant divergence is an early warning that the model is now operating outside the conditions it was validated for.
`,

  deployment: `
### Exporting a trained CNN to ONNX

~~~python
import torch

model.eval()
dummy_input = torch.randn(1, 3, 224, 224)
torch.onnx.export(
    model, dummy_input, "model.onnx",
    input_names=["image"], output_names=["logits"],
    dynamic_axes={"image": {0: "batch"}, "logits": {0: "batch"}},  # allow variable batch size
    opset_version=17,
)
~~~

### Serving with ONNX Runtime (framework-agnostic, no PyTorch dependency in the serving container)

~~~python
import onnxruntime as ort
import numpy as np

session = ort.InferenceSession("model.onnx", providers=["CUDAExecutionProvider", "CPUExecutionProvider"])

def predict(image_array: np.ndarray) -> np.ndarray:
    outputs = session.run(["logits"], {"image": image_array.astype(np.float32)})
    return outputs[0]
~~~

For maximum GPU throughput, TensorRT compiles the ONNX graph further, fusing layers and selecting hardware-specific optimized kernels — commonly used when the last few milliseconds of latency matter (real-time video, autonomous driving perception).

### Production Dockerfile (inference-only, no training dependencies)

~~~dockerfile
FROM python:3.12-slim
WORKDIR /app
RUN pip install --no-cache-dir onnxruntime-gpu pillow numpy fastapi uvicorn
COPY models/model.onnx models/
COPY src/ src/
RUN useradd -m appuser
USER appuser
EXPOSE 8000
CMD ["uvicorn", "vision_service.api.main:app", "--host", "0.0.0.0", "--port", "8000"]
~~~

Why each choice matters: a slim image with only the inference runtime (not the full PyTorch training stack) minimizes image size and attack surface; the ONNX artifact decouples serving from the training framework entirely; non-root user follows the same container-hardening rule as any other production service.

### Serving topology

- Stateless inference pods behind a load balancer, autoscaled on GPU utilization or request queue depth.
- Health checks (/healthz) should include a real forward pass on a fixed dummy image, not just "process is up" — this catches a corrupted or missing model file at startup.
`,

  "production-checklist": `
Before a CNN-based vision service takes real traffic:

- [ ] Model exported to ONNX (or TensorRT) and validated to match PyTorch accuracy within tolerance
- [ ] Preprocessing code (resize, normalize, channel order) is identical between training and serving, and covered by a test
- [ ] Held-out test set accuracy, precision/recall, and confusion matrix reviewed and signed off
- [ ] Per-slice metrics reviewed (by class, by known difficult subgroup) — not just aggregate accuracy
- [ ] Inference latency measured under realistic batch size and hardware, with a documented p95/p99
- [ ] Input validation on uploaded images: size/format limits enforced before decoding
- [ ] Confidence thresholding and a human-review path defined for low-confidence predictions (if safety-relevant)
- [ ] Model file provenance verified; no untrusted pickle/checkpoint loaded directly into production
- [ ] Monitoring wired: RED metrics on the service, plus prediction-confidence and class-distribution tracking
- [ ] Data/version pinning: exact model version, preprocessing version, and dataset version recorded together
- [ ] Rollback plan: previous model version kept deployable, traffic-shiftable within minutes
- [ ] Load test performed at expected peak traffic with the real exported artifact, not the training-time model
- [ ] Non-root container, dependency CVE scan, no training-only dependencies in the serving image
- [ ] Golden regression set of known tricky images re-run on every model update before rollout
`,

  "common-mistakes": `
1. **Training from scratch on a small dataset** instead of using transfer learning — wastes data and compute, and reliably overfits.
2. **Normalizing with the wrong mean/std** (using generic 0.5/0.5/0.5 instead of the actual ImageNet stats a pretrained backbone expects, or vice versa) — silently degrades a pretrained model's performance.
3. **Forgetting model.eval() at inference time** — leaves BatchNorm/Dropout in training mode, producing inconsistent predictions.
4. **Augmenting the validation or test set** — produces an inflated or noisy accuracy signal that misleads model-selection decisions.
5. **Ignoring receptive field when designing an architecture** — stacking too few layers for objects that occupy a large fraction of the image means the network literally cannot "see" the whole object in one prediction.
6. **Using accuracy as the only metric on an imbalanced dataset** — hides a model that has effectively learned to always predict the majority class.
7. **Mismatched train/inference resolution** without adjustment — CNN accuracy is measurably sensitive to this and it is an easy thing to overlook when "just resizing for speed" in production.
8. **Treating flips/rotations/color jitter as universally safe augmentations** — wrong for text, digits, medical images, or anything where orientation or color carries meaning.
9. **Not freezing early layers during the first phase of fine-tuning** — large gradients from a randomly initialized new head can wreck good pretrained features before they've had a chance to stabilize.
10. **Deploying the raw training-time PyTorch model to production** instead of an optimized export — leaves significant, free latency and cost savings on the table.
`,

  "common-errors": `
| Error | Typical cause | Fix |
|-------|---------------|-----|
| RuntimeError: size mismatch in linear layer | Flatten dimension doesn't match conv output shape (wrong image size assumed) | Print shape before the Linear layer; compute in_features from the actual conv output |
| RuntimeError: expected 4D input, got 3D | Forgot the batch dimension (single image instead of a batch) | Use unsqueeze(0) to add a batch dim of 1 |
| CUDA out of memory | Batch size too large for GPU memory | Reduce batch size, use gradient accumulation, or enable mixed precision |
| Loss is NaN | Learning rate too high, or unnormalized inputs | Lower the learning rate; confirm normalization is applied; add gradient clipping |
| Validation accuracy far below training accuracy | Overfitting, or forgot model.eval() during validation | Add regularization/augmentation, or set model.eval() before evaluating |
| Model predicts the same class for everything | Class imbalance without a weighted loss, or a training/label bug | Check label distribution; use weighted CrossEntropyLoss or resampling |
| Accuracy drops after ONNX export | Preprocessing not replicated identically, or an unsupported op silently changed behavior | Diff predictions between PyTorch and ONNX Runtime on the same input; check op compatibility |
| Extremely slow training with high GPU-idle time | Data loading is the bottleneck, not compute | Increase DataLoader num_workers, enable pin_memory, pre-resize images to disk |
| Filters/feature maps look like pure noise after training | Learning rate too high, dead ReLUs, or a data pipeline bug feeding garbage | Visualize inputs and filters; lower learning rate; check BatchNorm placement |
`,

  faqs: `
**Q: Do I need to understand the convolution math by hand, or can I just call nn.Conv2d?**
Both. You will call nn.Conv2d in practice, but understanding the sliding-window dot-product by hand is what lets you reason correctly about output shapes, receptive fields, and why certain architecture choices (stride vs pooling, kernel size) matter — it's the difference between copying a tutorial and designing an architecture.

**Q: Are CNNs obsolete now that Vision Transformers exist?**
No. CNNs remain the more compute- and data-efficient choice for most production vision tasks, especially with moderate dataset sizes and tight latency/edge-deployment budgets. ViTs and hybrid architectures tend to win at very large scale or in multimodal settings. Know both; see the Comparisons section and the Transformers skill.

**Q: Why does my fine-tuned model do worse than the pretrained baseline on some classes?**
Usually class imbalance in your fine-tuning dataset, too aggressive a learning rate that overwrote useful pretrained features, or too few epochs for the new head to stabilize before unfreezing. Check per-class metrics, not just overall accuracy.

**Q: How much data do I actually need to fine-tune a pretrained CNN?**
Often a few hundred to a few thousand images per class is enough for a reasonable result, precisely because transfer learning reuses the general features ImageNet pretraining already learned. Training from scratch needs vastly more.

**Q: Max pooling or average pooling?**
Max pooling is the default for most classification tasks — it preserves the strongest activation, which is usually the most informative signal for "is this pattern present." Average pooling (especially global average pooling at the very end of a network) is preferred when you want a smooth summary of the whole feature map rather than its single strongest response.

**Q: What image resolution should I train at?**
Match your production input resolution when possible; if you must train at a lower resolution than production traffic for speed, briefly fine-tune at the production resolution before deploying, since CNN accuracy is measurably sensitive to train/test resolution mismatch.

**Q: How do I pick between ResNet, MobileNet, EfficientNet, and a Vision Transformer for a new project?**
Start with the smallest pretrained model that meets your accuracy bar on a quick baseline experiment; only reach for a bigger architecture if accuracy is actually the bottleneck. For edge/mobile, start with MobileNet/EfficientNet. See the Comparisons section for the fuller decision framework.
`,

  "interview-questions": `
**Junior/Mid:**

1. *Why not use a plain fully connected network for images?* Parameter explosion with image size, and no translation invariance/equivariance — a pattern learned at one location doesn't transfer to another location without relearning.
2. *What does a convolution layer actually compute?* Slide a small learnable filter across the input, computing a dot product (element-wise multiply and sum) plus bias at every position, producing a feature map.
3. *What's the difference between stride and padding?* Stride controls how far the filter moves between applications (affects output size and compute); padding adds border pixels so edge positions are covered and output size can be controlled.
4. *Max pooling vs average pooling?* Max keeps the strongest activation in each window (better for "is this pattern present"); average smooths the whole window (better for a general summary, common as global average pooling before classification).
5. *What does batch normalization do and where does it go?* Normalizes each channel's activations across the batch to stabilize and speed up training; placed after the conv layer and before the activation function.

**Senior:**

6. *Explain the residual connection in ResNet and why it was needed.* Beyond roughly 20–30 plain stacked layers, gradients struggle to propagate and accuracy degrades even on the training set (the degradation problem, not overfitting). A residual block outputs F(x) + x instead of H(x) directly, so if the ideal mapping is close to identity, the network only needs to push the residual toward zero — much easier to optimize, and it enabled 50+ to 150+ layer networks.
7. *What is the receptive field and how do you compute it?* The region of the original input that can influence a given unit; grows as you stack conv/pool layers (a 3x3 conv followed by another 3x3 conv gives a 5x5 effective receptive field; pooling multiplies the growth). Strong answers explain why two stacked 3x3 convs can replace one 5x5 conv with fewer parameters and an extra nonlinearity.
8. *Walk through transfer learning strategy for a small custom dataset.* Start from an ImageNet-pretrained backbone, freeze it, train only a new head for a few epochs, then unfreeze the top block(s) and fine-tune the whole network at a much lower learning rate; monitor per-class validation metrics throughout.
9. *How would you reduce a CNN's inference latency for a real-time application?* In order: pick a smaller/more efficient architecture (MobileNet-class or depthwise separable convs), use mixed precision, export to ONNX/TensorRT for kernel fusion, quantize to int8 if accuracy holds up, and batch requests server-side if latency budget allows.
10. *Explain why CNNs historically needed data augmentation, and connect it to what convolution does and doesn't provide.* Convolution gives translation equivariance for free but nothing for rotation, scale, or lighting changes; augmentation manufactures training examples that teach those additional invariances explicitly.
11. *When would you choose a Vision Transformer over a CNN, and vice versa?* ViT when you have very large-scale pretraining data/compute or need to share an architecture with a multimodal text pipeline; CNN when data or compute is moderate, latency/edge deployment matters, or you want the built-in locality bias for faster convergence on smaller datasets.
12. *What's the difference between a standard convolution and a depthwise separable convolution, and why does it matter for mobile deployment?* Standard conv mixes spatial and channel information in one operation; depthwise separable splits it into a per-channel spatial pass and a 1x1 channel-mixing pass, cutting compute roughly 8–9x with a modest accuracy cost — the basis of MobileNet-class edge-friendly architectures.
`,

  "coding-questions": `
### 1. Compute conv output shape and implement a naive 2D convolution (tests core mechanics)

~~~python
import numpy as np

def conv2d_naive(input_2d: np.ndarray, kernel: np.ndarray, stride: int = 1, padding: int = 0) -> np.ndarray:
    """Single-channel 2D convolution, computed directly with nested loops (for understanding, not speed)."""
    if padding > 0:
        input_2d = np.pad(input_2d, padding)
    h, w = input_2d.shape
    kh, kw = kernel.shape
    out_h = (h - kh) // stride + 1
    out_w = (w - kw) // stride + 1
    output = np.zeros((out_h, out_w))
    for i in range(out_h):
        for j in range(out_w):
            row, col = i * stride, j * stride
            patch = input_2d[row:row + kh, col:col + kw]
            output[i, j] = np.sum(patch * kernel)     # element-wise multiply, then sum
    return output

kernel = np.array([[1, 0, 1], [0, 1, 0], [1, 0, 1]])
image = np.array([
    [1, 2, 3, 0, 1], [0, 1, 2, 3, 0], [3, 0, 1, 2, 1],
    [1, 2, 0, 1, 3], [0, 1, 2, 3, 1],
])
out = conv2d_naive(image, kernel)
assert out[0, 0] == 9      # matches the worked example in Beginner Concepts
~~~

Complexity: O(out_h x out_w x kh x kw) — this is exactly why real implementations use im2col + GEMM (or FFT for very large kernels) instead of nested Python loops. Follow-up: extend to multiple input channels and multiple output filters.

### 2. Compute the effective receptive field of a stack of layers

~~~python
def receptive_field(layers: list[tuple[int, int]]) -> int:
    """layers: list of (kernel_size, stride) from first to last layer.
    Returns the effective receptive field on the original input."""
    rf = 1
    total_stride = 1
    for kernel_size, stride in layers:
        rf += (kernel_size - 1) * total_stride
        total_stride *= stride
    return rf

# Two 3x3 stride-1 convs followed by a 2x2 stride-2 pool
layers = [(3, 1), (3, 1), (2, 2)]
print(receptive_field(layers))   # 5 -> matches the 5x5 example in Advanced Concepts
~~~

Complexity: O(number of layers). Follow-up: extend to handle asymmetric height/width receptive fields, and dilated convolutions (which skip pixels within the kernel to grow the receptive field even faster without extra parameters).

### 3. Implement and unit-test a simple image classifier training step (production-flavored)

~~~python
import torch
import torch.nn as nn

def train_step(model: nn.Module, images: torch.Tensor, labels: torch.Tensor,
               optimizer: torch.optim.Optimizer) -> float:
    """One training step with basic error handling for shape mismatches."""
    if images.dim() != 4:
        raise ValueError(f"expected 4D input (batch, C, H, W), got shape {images.shape}")
    model.train()
    optimizer.zero_grad()
    logits = model(images)
    loss = nn.functional.cross_entropy(logits, labels)
    loss.backward()
    torch.nn.utils.clip_grad_norm_(model.parameters(), max_norm=5.0)  # guard against exploding gradients
    optimizer.step()
    return loss.item()
~~~

Discussion points: why gradient clipping is a cheap insurance policy against occasional bad batches, why cross_entropy expects raw logits (not softmax output) in PyTorch, and how you'd extend this to mixed-precision training with torch.cuda.amp.
`,

  "hands-on-labs": `
### Lab 1 — Hand-compute and verify a convolution (beginner, ~1h)
Take the 5x5 input and 3x3 kernel from Beginner Concepts, compute the full 3x3 output feature map by hand for every position, then verify with the naive conv2d_naive implementation from Coding Questions. Stretch: repeat with stride 2 and with padding 1. Skills: the core convolution mechanics, without a framework hiding the arithmetic.

### Lab 2 — Train a small CNN on CIFAR-10 from scratch (intermediate, ~2h)
Build the SmallCNN from Intermediate Concepts, train it on CIFAR-10 with and without data augmentation, and compare validation accuracy and the train/val loss gap. Plot the first conv layer's learned filters. Deliverable: a short report with both accuracy curves and the filter visualization. Skills: full training loop, augmentation, overfitting diagnosis.

### Lab 3 — Transfer learning on a custom dataset (advanced, ~3h)
Collect or download a small (a few hundred images per class) custom image classification dataset. Fine-tune a pretrained ResNet-18 in two phases (frozen backbone, then partial unfreeze) and report per-class precision/recall. Compare against training the same architecture from scratch on the same data. Skills: transfer learning strategy, per-class evaluation, the practical value of pretraining.

### Lab 4 — Export and benchmark for production (production, ~3h)
Take Lab 3's fine-tuned model, export it to ONNX, serve it behind a FastAPI endpoint, and benchmark latency at batch sizes 1, 8, and 32 on CPU and (if available) GPU. Quantize to int8 and re-measure both latency and accuracy on your held-out test set. Deliverable: a latency-vs-accuracy table and a one-paragraph deployment recommendation. Skills: the entire production section, end to end.
`,

  "real-projects": `
Portfolio-grade projects that demonstrate CNN competence to employers:

1. **Defect detection pipeline** — Train a CNN (transfer learning from a pretrained backbone) to classify manufacturing defects from a public or synthetic dataset, handle severe class imbalance correctly (weighted loss, proper metrics), export to ONNX, and serve behind a FastAPI endpoint with confidence thresholding and a human-review path for low-confidence predictions. Demonstrates: real-world class imbalance handling, production export, safety-conscious design.

2. **Visual similarity search** — Use a pretrained CNN's penultimate-layer embeddings to build a "find similar images" service: extract embeddings for a product catalog, index them with an approximate nearest-neighbor library, and expose a query-by-image API. Demonstrates: transfer learning as a feature extractor (not just a classifier), and connects directly to the **Vector Search** skill for the retrieval half of the system.

3. **Real-time edge inference demo** — Take a MobileNet-class model, quantize it to int8, export to ONNX Runtime, and build a small webcam-driven demo (e.g. a browser or Raspberry Pi client) that classifies frames in real time, reporting actual measured end-to-end latency. Demonstrates: the full model-size-vs-latency tradeoff discussion made concrete and measured, not theoretical.

Each project: versioned dataset and preprocessing, full type-hinted Python, a pytest suite covering the pipeline code (not just the model), a README with an architecture diagram, and honest reported metrics including failure cases — the engineering discipline around the model is what distinguishes a senior portfolio piece from a tutorial copy.
`,

  "case-studies": `
### AlexNet and ILSVRC 2012: the moment deep learning restarted
AlexNet won the 2012 ImageNet competition by a margin so large over the next-best (non-deep) approach that it is widely credited with restarting mainstream interest in deep learning after the field's quieter years. The specific enabling factors — GPUs finally fast enough for large conv nets, ReLU avoiding vanishing-gradient issues that had hurt earlier deep networks, dropout controlling overfitting in a network with millions of parameters, and ImageNet finally providing enough labeled data — is a case study in how architecture, compute, and data all had to arrive together before an idea from the 1980s/1990s could work at scale.

### ResNet and the "degradation problem"
Before ResNet, researchers observed something counter-intuitive: simply stacking more conv layers past a certain depth made both training AND test accuracy *worse*, which ruled out the obvious explanation of overfitting. He et al.'s insight — that this was an optimization difficulty, not a capacity or generalization problem, and that reformulating layers to learn residuals fixes it — is a lesson in distinguishing "the model can't represent this" from "the model can't be trained to find this," a distinction that recurs constantly in deep learning debugging.

### MobileNet and the edge-deployment constraint
MobileNet's depthwise separable convolution was motivated entirely by a production constraint most academic architecture papers ignore: real phones have tight compute, memory, and battery budgets. The lesson for engineers: the "best" architecture is task- and constraint-dependent — a model that is 2 points less accurate on a benchmark but 8x smaller and faster is very often the correct production choice, not a compromise.

### Vision Transformers and the "does locality bias still matter" debate
ViT's 2020 result — that a pure attention architecture with no convolutional locality bias can match CNN accuracy given enough pretraining data — reopened a debate the field had considered settled. The subsequent response from CNN-side work (ConvNeXt and similar "modernized CNN" papers) narrowing the gap again is itself the lesson: architecture debates in deep learning are rarely permanently resolved, and a good engineer tracks both sides rather than committing to one architecture family as dogma.
`,

  comparisons: `
| Dimension | CNN (ResNet-class) | MobileNet/EfficientNet | Vision Transformer (ViT) | Classical (SIFT+SVM) |
|-----------|--------------------|-----------------------|---------------------------|------------------------|
| Inductive bias | Strong (locality, translation equivariance) | Strong, plus efficiency-focused | Weak — learns spatial structure from data | Hand-designed, fixed |
| Data efficiency (from scratch) | Good | Good | Needs large-scale pretraining to match CNNs | Works with small data but low ceiling |
| Parameter/compute efficiency | Moderate | Excellent (built for it) | Often heavier for equivalent accuracy | Very light, but low accuracy ceiling |
| Accuracy at large scale/data | Strong | Slightly below full CNNs, by design | Matches or exceeds CNNs at very large scale | Well below deep learning approaches |
| Edge/mobile deployment | Feasible with optimization | The default choice | Harder — typically larger and slower | Very cheap, but limited capability |
| Interpretability of features | Moderate (visualize filters/feature maps) | Same as CNN family | Attention maps offer some interpretability | High (explicit hand-designed features) |
| Multimodal fit (text + image together) | Requires a separate fusion mechanism | Same as CNN family | Natural fit — same attention mechanism as language models | Not applicable |

**How seniors choose**: default to a pretrained CNN (ResNet-class) for most moderate-scale production vision tasks — it's well-understood, fast to fine-tune, and has mature deployment tooling. Reach for MobileNet/EfficientNet specifically when the deployment target is mobile or edge hardware. Reach for a Vision Transformer when you have large-scale pretraining data/compute available, or when the vision component needs to share an architecture and possibly a training recipe with a text/multimodal system (see the **Transformers** skill). Classical hand-engineered features are now mostly a teaching tool and a fallback for extremely constrained embedded hardware, not a competitive production choice.
`,

  "related-technologies": `
- **Neural Networks** — the prerequisite: backpropagation, activation functions, and optimization that every CNN training loop relies on.
- **Deep Learning** — the broader framing of depth, regularization, and optimization techniques CNNs share with every other deep architecture.
- **RNNs** — the historical sequence-modeling counterpart to CNNs; useful contrast for understanding why spatial locality (CNN) and temporal order (RNN) each need their own architectural bias.
- **Attention** and **Transformers** — the architecture family that both powers Vision Transformers and appears inside modern hybrid CNN designs (e.g. attention modules bolted onto conv backbones).
- **Embeddings** — a pretrained CNN's penultimate-layer output IS an embedding; understanding embeddings generally clarifies what transfer learning is actually reusing.
- **Vector Search** — the retrieval technology that turns CNN-produced image embeddings into a working visual search or recommendation system.
- **Machine Learning** — train/val/test methodology, overfitting, and evaluation metrics that apply directly to CNN training.
- **Vision AI** — the production application layer this page enables: object detection, segmentation, OCR, and visual search systems that use CNN (or hybrid) backbones internally.
- **PyTorch** — the framework used throughout this page's code examples; deeper framework-specific mastery compounds directly with everything here.
- **ONNX / TensorRT** (deployment tooling) — the standard export path from a trained CNN to an optimized production inference artifact.

On this platform, a natural learning path: **Neural Networks** → **CNNs** (this page) → **Vision AI** for production applications, or **CNNs** → **RNNs** → **Attention** → **Transformers** for the sequence-modeling and multimodal branch.
`,

  "latest-updates": `
Verified against my knowledge through my training cutoff (early 2026) — check recent computer vision conference proceedings (CVPR, ICCV, NeurIPS) and library release notes for anything newer.

- **ConvNeXt and "modernized CNN" designs** continued to demonstrate that CNNs, when given transformer-era training recipes (larger-scale pretraining, better augmentation, updated normalization/activation choices), remain highly competitive with Vision Transformers on standard benchmarks — the CNN-vs-ViT gap is narrower and more task-dependent than early ViT papers suggested.
- **Hybrid CNN-attention architectures** (convolutional stems feeding into transformer blocks, or attention modules inserted into conv backbones) have become common, capturing convolution's data efficiency and locality bias alongside attention's ability to model long-range relationships.
- **Efficient architecture search and mobile-first design** (successors in the MobileNet/EfficientNet lineage) continue to push the accuracy-per-FLOP frontier for on-device and edge deployment.
- **Quantization and deployment tooling** (ONNX Runtime, TensorRT, and mobile-specific runtimes) have matured significantly, making int8 and even lower-precision inference a default production step rather than an advanced optimization.
- **Foundation-model-style vision backbones** (large-scale pretrained CNN or hybrid encoders reused across many downstream tasks via fine-tuning or as frozen feature extractors) increasingly mirror the pretrain-once, fine-tune-everywhere pattern that transformed NLP.

Because architecture research in vision moves quickly, verify any specific benchmark number or newly announced model against current leaderboards and library documentation before quoting it in an interview or a design document.
`,

  "future-roadmap": `
Where CNNs and CNN-adjacent vision architectures are heading:

1. **The CNN-vs-ViT debate settles into "use both."** Expect continued hybrid designs rather than one architecture family fully displacing the other; a senior vision engineer should be equally comfortable reasoning about convolutional locality bias and attention-based global reasoning.
2. **Efficiency keeps improving faster than raw accuracy.** With foundation-scale pretraining largely solved for vision-classification-style tasks, a growing share of research and industry effort is going into making existing accuracy levels cheaper — smaller, faster, more quantization-friendly architectures for edge and real-time deployment.
3. **Multimodal fusion becomes the default**, not the exception. Vision backbones (CNN or ViT) increasingly serve as one input stream feeding a shared multimodal model alongside text (and sometimes audio), rather than standalone image classifiers — directly relevant to the **Transformers** and multimodal skills on this platform.
4. **Self-supervised and weakly-supervised pretraining reduces reliance on massive labeled datasets** — the ImageNet-labels-required paradigm is gradually giving way to pretraining on much larger, weakly-labeled or unlabeled image collections, with fine-tuning still using much smaller labeled sets.
5. **Deployment tooling keeps converging** — ONNX as a common export target and increasingly capable runtimes (TensorRT, mobile NPUs) mean the gap between "a model that works in a notebook" and "a model that runs efficiently on a phone or embedded device" keeps shrinking.

For your career: invest deeply in the fundamentals on this page (convolution, receptive field, transfer learning) because they transfer directly to whatever the dominant architecture becomes next, then keep the Comparisons and Latest Updates sections current as the CNN/ViT/hybrid landscape continues to shift.
`,

  "cheat-sheet": `
~~~python
# --- Convolution basics ---
# output_size = floor((input + 2*padding - kernel) / stride) + 1
import torch.nn as nn
conv = nn.Conv2d(in_channels=3, out_channels=64, kernel_size=3, stride=1, padding=1)

# --- Pooling ---
pool = nn.MaxPool2d(kernel_size=2, stride=2)     # halves H and W
avgpool = nn.AdaptiveAvgPool2d(1)                # global average pool -> 1x1 per channel

# --- Standard conv block ---
nn.Sequential(
    nn.Conv2d(in_c, out_c, 3, padding=1, bias=False),
    nn.BatchNorm2d(out_c),
    nn.ReLU(inplace=True),
)

# --- Residual block core idea ---
# out = F(x) + x   (learn the residual, not the full mapping)

# --- Receptive field growth ---
# rf_new = rf_old + (kernel_size - 1) * stride_product_so_far

# --- Transfer learning recipe ---
from torchvision.models import resnet18, ResNet18_Weights
model = resnet18(weights=ResNet18_Weights.IMAGENET1K_V1)
for p in model.parameters(): p.requires_grad = False   # freeze backbone
model.fc = nn.Linear(model.fc.in_features, num_classes)  # new head, trainable
# phase 2: unfreeze model.layer4, fine-tune at a lower LR

# --- Data augmentation (train only) ---
import torchvision.transforms as T
T.Compose([
    T.RandomResizedCrop(224), T.RandomHorizontalFlip(),
    T.ColorJitter(0.2, 0.2, 0.2), T.ToTensor(),
    T.Normalize([0.485, 0.456, 0.406], [0.229, 0.224, 0.225]),
])

# --- Eval mode matters ---
model.eval()   # disables Dropout, freezes BatchNorm running stats

# --- Export for production ---
import torch
torch.onnx.export(model, dummy_input, "model.onnx",
                   dynamic_axes={"input": {0: "batch"}})

# --- Optimization hierarchy ---
# pretrained -> right-sized arch -> mixed precision -> batching
# -> quantization (int8) -> ONNX/TensorRT export
~~~
`,

  "flash-cards": `
| Front | Back |
|-------|------|
| Why not use an MLP on raw images? | Parameter explosion with resolution, and no translation invariance — patterns must be relearned at every position |
| What is a feature map? | The 2D output of one filter applied across the whole input, showing where that pattern was detected |
| Output size formula for a conv layer | floor((input + 2*padding - kernel) / stride) + 1 |
| Max pooling vs average pooling | Max keeps the strongest activation (pattern presence); average smooths the whole window (general summary) |
| What did AlexNet specifically contribute in 2012? | ReLU, dropout, GPU training, and augmentation at scale — winning ImageNet by a huge margin over non-deep methods |
| What did VGG show? | Stacking small 3x3 filters (depth) beats using fewer, larger filters — better receptive field per parameter |
| What problem does ResNet's residual connection solve? | The degradation problem: very deep plain stacks got worse on training accuracy too, from optimization difficulty, not overfitting |
| Residual block formula | output = F(x) + x — learn the residual, not the full mapping |
| What is the receptive field? | The region of the original input that can influence a given unit's output |
| Why do two stacked 3x3 convs beat one 5x5 conv? | Same effective receptive field, fewer parameters, and an extra nonlinearity in between |
| What does batch normalization do? | Normalizes per-channel activations across the batch, stabilizing and speeding up training |
| Why use transfer learning instead of training from scratch? | Pretrained features (edges, textures, shapes) transfer broadly; far more data-efficient on a small custom dataset |
| Are CNNs still relevant given Vision Transformers? | Yes — more compute/data-efficient for most production tasks, especially at moderate scale and on edge devices |
| What is a depthwise separable convolution? | A standard conv factored into per-channel spatial + 1x1 channel-mixing steps — much cheaper, used in MobileNet |
| Standard production export path | PyTorch model -> ONNX -> ONNX Runtime or TensorRT for optimized serving |
`,

  mcqs: `
**1. A 7x7 input convolved with a 3x3 kernel, stride 1, no padding — what is the output size?**

A) 7x7  B) 5x5  C) 4x4  D) 3x3

**Answer: B** — floor((7 + 0 - 3) / 1) + 1 = 5.

**2. Which statement about pooling is TRUE?**

A) Pooling layers have learnable weights  B) Max pooling always uses a 3x3 window  C) Pooling reduces spatial size and adds local shift-tolerance  D) Pooling increases the number of channels

A) False B) False C) **Answer: C** D) False — pooling has no learnable parameters, is commonly 2x2, and never changes channel count.

**3. What specific problem did ResNet's residual connections solve?**

A) Overfitting on small datasets  B) Slow inference on mobile devices  C) The degradation problem in very deep plain networks  D) Class imbalance during training

**Answer: C** — deep plain stacks degraded on training accuracy itself due to optimization difficulty, which residual connections fixed.

**4. Why is a validation set augmented like the training set a bad idea?**

A) It makes training slower  B) It produces an inflated or misleading accuracy signal, since it no longer represents real deployment inputs  C) It is technically impossible in PyTorch  D) It has no effect either way

**Answer: B**

**5. Which architecture choice specifically targets mobile/edge deployment efficiency?**

A) Increasing fully connected layer width  B) Depthwise separable convolutions  C) Adding more pooling layers only  D) Removing batch normalization

**Answer: B** — depthwise separable convolutions (MobileNet) cut compute roughly 8-9x versus standard convolutions for similar filter sizes.

**6. In transfer learning, why freeze the pretrained backbone during the first fine-tuning phase?**

A) Frozen layers train faster on GPU  B) It prevents large gradients from a randomly initialized new head from destroying useful pretrained features before the head stabilizes  C) PyTorch requires it  D) It has no real benefit, it's just convention

**Answer: B**
`,

  "revision-notes": `
**Core idea in 4 lines:** A convolution slides a small learnable filter across an input, computing a dot product at every position to produce a feature map. This gives parameter sharing (few weights, reused everywhere) and translation equivariance (a learned pattern is detected anywhere in the image) — the two properties plain MLPs lack for image data. Stride controls how far the filter moves; padding controls border handling and output size.

**Hierarchy and downsampling in 3 lines:** Stacking conv layers builds a feature hierarchy — edges, then textures, then parts, then objects — purely from data via backpropagation. Pooling (max or average) downsamples feature maps, reduces compute, and adds local shift-tolerance. Receptive field (the input region influencing a unit) grows as you stack layers, which is the key design lever for how much spatial context a layer can "see."

**Architecture history in 5 lines:** LeNet set the conv-pool-FC template (1998). AlexNet (2012) proved it at scale on GPUs with ReLU, dropout, and augmentation — the breakthrough moment for deep learning broadly. VGG showed stacked small 3x3 filters beat larger ones for the same receptive field, more efficiently. ResNet's residual connections (F(x) + x) solved the degradation problem and enabled 50-150+ layer networks. Vision Transformers (2020+) since matched or exceeded CNNs at large scale with no convolution at all, though CNNs remain more data/compute-efficient at moderate scale.

**Practical workflow in 4 lines:** Start from a pretrained backbone (ImageNet), not from scratch, for almost any real task. Augment training data to teach invariances your task actually needs (flips, crops, color jitter) — never augment validation/test data. Fine-tune in two phases: freeze then unfreeze with a low learning rate. Evaluate with per-class metrics, not just aggregate accuracy, especially under class imbalance.

**Production in 4 lines:** Match training and inference preprocessing exactly — silent mismatches are the most common production bug. Export to ONNX (then optionally TensorRT) rather than serving raw training-time PyTorch. Optimize in order: pretrained model, right-sized architecture, mixed precision, batching, quantization, compiled export. Monitor prediction confidence and class distribution in production, not just service-level RED metrics.
`,

  "learning-roadmap": `
A realistic path from zero to production-competent with CNNs (assumes Neural Networks fundamentals are already solid):

**Week 1 — Convolution mechanics.** Beginner Concepts + Lab 1 (hand-compute a convolution). Daily: work through 3-5 output-shape calculations by hand with different stride/padding combinations. Milestone: you can predict a conv layer's output shape without running code.

**Week 2 — Building and training a CNN.** Intermediate Concepts + Lab 2 (train SmallCNN on CIFAR-10). Milestone: a trained model with a documented accuracy curve, plus a visualization of its first-layer filters.

**Week 3 — Architecture history and receptive fields.** Advanced Concepts: LeNet through ResNet, the residual connection, receptive field math. Read the original ResNet paper's abstract and results section. Milestone: explain the degradation problem and why residual connections fix it, out loud, unprompted.

**Week 4 — Transfer learning.** Lab 3 (fine-tune a pretrained ResNet on a custom dataset, two-phase freeze/unfreeze). Milestone: a fine-tuned model with per-class precision/recall reported, compared against a from-scratch baseline on the same data.

**Week 5 — Production deployment.** Production Usage through Deployment sections + Lab 4 (export to ONNX, benchmark latency, quantize). Milestone: a documented latency-vs-accuracy tradeoff table for at least three configurations.

**Week 6 — Interview polish + comparisons.** Interview/Coding Questions sections; read the Comparisons section against Vision Transformers until you can argue both sides. Milestone: comfortably answer "when would you choose a CNN vs a ViT" with a real tradeoff argument, not a memorized answer.

Then continue to **Vision AI** on this platform for object detection, segmentation, and full production vision-system architecture, or to **RNNs** → **Attention** → **Transformers** for the sequence-modeling and Vision Transformer branch.
`,

  "official-docs": `
- [PyTorch nn.Conv2d documentation](https://pytorch.org/docs/stable/generated/torch.nn.Conv2d.html) — exact parameter semantics for stride, padding, dilation, groups.
- [PyTorch torchvision.models documentation](https://pytorch.org/vision/stable/models.html) — pretrained CNN backbones (ResNet, MobileNet, EfficientNet, and more) with weight enums.
- [torchvision.transforms documentation](https://pytorch.org/vision/stable/transforms.html) — the standard data augmentation toolkit used throughout this page.
- [ONNX documentation](https://onnx.ai/onnx/) — the export format used in Deployment.
- [ONNX Runtime documentation](https://onnxruntime.ai/docs/) — the inference runtime for serving exported models.
- [NVIDIA TensorRT documentation](https://docs.nvidia.com/deeplearning/tensorrt/) — GPU-optimized inference for latency-critical deployment.
- [Stanford CS231n course notes](https://cs231n.github.io/) — not an official vendor doc, but the closest thing to a canonical, rigorous, freely available CNN reference; read the convolutional networks module directly.
`,

  books: `
- **Deep Learning** — Goodfellow, Bengio, Courville. The rigorous mathematical foundation for convolution, pooling, and the broader deep learning theory this page builds on.
- **Dive into Deep Learning (d2l.ai)** — Zhang, Lipton, Li, Smola. Free online, code-first, with runnable PyTorch/MXNet examples for every CNN concept on this page.
- **Deep Learning for Computer Vision** — Rajalingappaa Shanmugamani. Practical, implementation-focused coverage of CNN architectures and computer vision tasks.
- **Programming PyTorch for Deep Learning** — Ian Pointer. Hands-on PyTorch specifically, including CNN training and deployment workflows.
- **Grokking Deep Learning** — Andrew Trask. Builds convolution and backpropagation from raw NumPy first, excellent for genuinely understanding the mechanics before relying on a framework.
- **Neural Networks and Deep Learning** — Michael Nielsen (free online). Gentle, well-illustrated introduction that precedes and complements this page's CNN-specific depth.
`,

  blogs: `
- **CS231n course notes (Stanford, cs231n.github.io)** — the single highest-signal free resource for CNN fundamentals; written for a rigorous university course but very readable.
- **distill.pub** (archived but still excellent) — outstanding interactive visual explanations of convolution, feature visualization, and receptive fields.
- **PyTorch official blog and tutorials** (pytorch.org/blog, pytorch.org/tutorials) — up-to-date, runnable examples for CNN training, transfer learning, and quantization.
- **Papers With Code — Image Classification** (paperswithcode.com) — current leaderboards and linked code for tracking the CNN-vs-ViT-vs-hybrid landscape as it evolves.
- **Sebastian Ruder's blog** — broader deep learning methodology, including transfer learning strategy that applies directly to CNN fine-tuning.
- **Lilian Weng's blog (lilianweng.github.io)** — clear, well-cited deep dives that touch CNN architecture history and modern vision architectures.
`,

  "research-papers": `
CNN-relevant papers worth reading directly, roughly in the order they build on each other:

- **"Gradient-Based Learning Applied to Document Recognition"** (LeCun et al., 1998) — the LeNet-5 paper; the original conv-pool-FC template.
- **"ImageNet Classification with Deep Convolutional Neural Networks"** (Krizhevsky, Sutskever, Hinton, 2012) — the AlexNet paper; read this to understand exactly what changed to make the 2012 breakthrough possible.
- **"Very Deep Convolutional Networks for Large-Scale Image Recognition"** (Simonyan & Zisserman, 2014) — the VGG paper; the small-filter-depth argument in the authors' own words.
- **"Going Deeper with Convolutions"** (Szegedy et al., 2014) — the GoogLeNet/Inception paper; multi-scale conv blocks and 1x1 bottlenecks.
- **"Deep Residual Learning for Image Recognition"** (He et al., 2015) — the ResNet paper; read the degradation-problem motivation section closely, not just the residual-block diagram.
- **"MobileNets: Efficient Convolutional Neural Networks for Mobile Vision Applications"** (Howard et al., 2017) — the depthwise separable convolution paper.
- **"An Image is Worth 16x16 Words: Transformers for Image Recognition at Scale"** (Dosovitskiy et al., 2020) — the original Vision Transformer (ViT) paper; essential for understanding the honest CNN-vs-ViT comparison in Advanced Concepts.
- **"A ConvNet for the 2020s"** (Liu et al., 2022) — the ConvNeXt paper; the "modernized CNN" response showing the CNN-vs-ViT gap is narrower than early ViT results suggested.

If you read only two: the AlexNet paper (for the historical breakthrough) and the ResNet paper (for the single most-reused architectural idea in all of deep learning, including inside every Transformer block).
`,

  videos: `
- **Stanford CS231n lectures (Fei-Fei Li, Andrej Karpathy, Justin Johnson)** — the canonical university-course video series on CNNs; freely available, extremely thorough.
- **3Blue1Brown — "But what is a convolution?" and the neural network series** — outstanding visual intuition for the convolution operation itself.
- **Andrej Karpathy — "Building makemore" and CNN-adjacent build-from-scratch videos** — implementing core mechanics by hand, in the same spirit as this page's worked examples.
- **Yannic Kilcher's paper-review channel** — walks through the AlexNet, ResNet, and ViT papers in accessible video form, good for reinforcing the Research Papers section.
- **Two Minute Papers** — short, accessible summaries of new computer vision research as it's published, useful for a lightweight way to track Latest Updates over time.
`,

  "github-repos": `
- [pytorch/vision (torchvision)](https://github.com/pytorch/vision) — official pretrained CNN models, transforms, and datasets used throughout this page's code.
- [pytorch/examples](https://github.com/pytorch/examples) — the official ImageNet and MNIST training scripts; a clean reference for a real training loop.
- [KaimingHe/deep-residual-networks](https://github.com/KaimingHe/deep-residual-networks) — the original ResNet authors' reference implementation.
- [google-research/vision_transformer](https://github.com/google-research/vision_transformer) — the original ViT reference implementation, useful for the honest CNN-vs-ViT comparison.
- [onnx/onnx](https://github.com/onnx/onnx) and [microsoft/onnxruntime](https://github.com/microsoft/onnxruntime) — the export format and runtime covered in Deployment.
- [NVIDIA/TensorRT](https://github.com/NVIDIA/TensorRT) — the GPU-optimized inference engine referenced in Performance and Deployment.
- [rwightman/pytorch-image-models (timm)](https://github.com/rwightman/pytorch-image-models) — an enormous, well-maintained library of pretrained CNN and ViT backbones; the practical go-to for transfer learning in real projects.
- [poloclub/cnn-explainer](https://github.com/poloclub/cnn-explainer) — an interactive, in-browser CNN visualization tool, excellent for building intuition alongside this page.
`,

  "practice-problems": `
**Ordered by skill focus:**

1. *Shape mechanics*: given a sequence of conv/pool layers with specified kernel/stride/padding, compute the final output shape and total parameter count by hand, then verify in PyTorch.
2. *Receptive field*: for a given stack of layers, compute the effective receptive field, then design a stack that achieves at least a target receptive field with the fewest parameters.
3. *From-scratch training*: train a small CNN on a public small-image dataset (CIFAR-10/CIFAR-100) with and without augmentation and batch normalization; report the effect of each ablation on validation accuracy.
4. *Transfer learning*: fine-tune a pretrained backbone on a small custom dataset in two phases; report per-class metrics and compare against a from-scratch baseline.
5. *Debugging*: given a deliberately broken training script (e.g. wrong normalization stats, missing model.eval(), unaugmented-but-labeled-as-augmented val set), find and fix each bug using the escalation path in Debugging.
6. *Deployment*: export a trained model to ONNX, verify numerical parity with the PyTorch original, and measure latency at several batch sizes and precisions (fp32 vs fp16 vs int8).
7. *Architecture design*: given a latency budget and an accuracy target, choose and justify an architecture family (full CNN, efficient CNN, or ViT) with a written tradeoff argument.

External sets: Kaggle image classification competitions (practical, leaderboard-driven practice), the CS231n assignment set (rigorous, from-scratch implementations), Papers With Code's Image Classification benchmarks (for tracking where current architectures stand).
`,

  "architecture-diagram": `
The reference production architecture for a CNN-based vision service — training pipeline feeding a versioned, exported model into a serving layer:

~~~mermaid
flowchart TB
    subgraph Training["Offline training pipeline"]
        DS["Labeled image dataset\n(versioned)"] --> Aug["Augmentation +\npreprocessing"]
        Aug --> Train["Train / fine-tune CNN\n(GPU, mixed precision)"]
        Train --> Eval["Held-out eval:\naccuracy, per-class metrics"]
        Eval -->|passes gate| Export["Export to ONNX"]
    end
    Export --> Registry[("Model registry\n(versioned artifacts)")]
    Registry --> Serve1["Inference pod 1\n(ONNX Runtime / TensorRT)"]
    Registry --> Serve2["Inference pod N"]
    Client["Client request\n(image)"] --> LB["Load balancer"]
    LB --> Serve1
    LB --> Serve2
    Serve1 & Serve2 --> Monitor["Monitoring:\nlatency, confidence drift,\nclass distribution"]
    Monitor -.triggers.-> Retrain["Retraining / rollback\ndecision"]
    Retrain -.-> Training
~~~

Every box in this diagram maps to a section on this page: Training to Production Usage and Testing, Export to Deployment, Monitor to Monitoring, and the Retrain feedback loop to Latest Updates and Future Roadmap thinking about when a deployed model needs revisiting.
`,

  "mind-map": `
~~~mermaid
mindmap
  root((CNNs))
    Core operation
      Convolution: kernel, stride, padding
      Feature maps
      Pooling: max / average
      Receptive field
    Architecture history
      LeNet
      AlexNet 2012
      VGG
      ResNet residual connections
      Vision Transformers (contrast)
    Building blocks
      Batch normalization
      1x1 convolutions
      Depthwise separable convs
      Global average pooling
    Training workflow
      Data augmentation
      Transfer learning
      Freeze / unfreeze fine-tuning
      Loss, optimizer, LR schedule
    Production
      ONNX / TensorRT export
      Quantization
      Latency vs accuracy tradeoffs
      Monitoring drift and confidence
    Ecosystem
      Neural Networks prerequisite
      Vision AI applications
      Vector Search embeddings
      Transformers / Attention comparison
    Career
      Interview classics: GIL-style depth questions
      Labs and portfolio projects
      Reading path to Vision AI
~~~
`,
};

export default cnn;
