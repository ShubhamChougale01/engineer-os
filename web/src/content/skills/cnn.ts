import type { SkillContent } from "../types";

const cnn: SkillContent = {
  overview: `
Convolutional Neural Networks (CNNs) are a neural network architecture (building directly on the **Neural Networks** skill's basic neuron/layer foundation) specifically designed for spatial data — most commonly images — using CONVOLUTION operations that slide small, learnable filters across an input, detecting local patterns (edges, textures, shapes) regardless of where in the image they appear. This architectural specialization directly encodes two genuinely powerful assumptions about spatial data: LOCALITY (nearby pixels are more related than distant ones) and TRANSLATION INVARIANCE (a useful pattern, like an edge or a cat's ear, is worth detecting no matter where it appears in the image) — assumptions a generic fully-connected network doesn't encode at all, and has to learn inefficiently from scratch if it can learn them at all.

CNNs were the architecture that triggered deep learning's modern resurgence (AlexNet's 2012 ImageNet win, covered in the **Deep Learning** skill's history), and remain the dominant, standard architecture for image-related tasks even in the era of Transformers, though Vision Transformers have become a genuine, increasingly competitive alternative for certain use cases. For an AI engineer working on multimodal AI systems, CNNs directly explain how vision encoders (often CNN-based, though increasingly Transformer-based) extract meaningful visual features that get combined with text in modern vision-language models.

Key characteristics: **convolutional layers**, sliding small filters across the input to detect local patterns while sharing the SAME filter weights across every spatial position (parameter sharing); **pooling layers**, reducing spatial dimensions while retaining the most salient detected features; **hierarchical feature learning**, with early layers detecting simple features (edges, colors) and later layers combining them into increasingly complex, abstract features (shapes, object parts, whole objects); and **translation invariance**, the property that lets a CNN recognize a pattern regardless of its exact position in the input.
`,

  history: `
| Year | Milestone |
|------|-----------|
| 1980 | **Fukushima's Neocognitron** introduces an early hierarchical, convolution-like architecture for visual pattern recognition, a genuine conceptual precursor to modern CNNs |
| 1989 | **Yann LeCun** applies backpropagation to a convolutional architecture for handwritten digit recognition, producing an early, genuinely practical CNN |
| 1998 | **LeNet-5** (LeCun et al.) becomes a widely-cited, foundational CNN architecture, successfully deployed commercially for reading handwritten checks |
| 2012 | **AlexNet** (Krizhevsky, Sutskever, Hinton) wins ImageNet by a dramatic margin using a deep CNN trained on GPUs, directly triggering the modern deep learning revolution (covered in depth in the **Deep Learning** skill) |
| 2014 | **VGGNet** demonstrates that simply stacking more, smaller convolutional layers can substantially improve performance, and **GoogLeNet (Inception)** introduces more computationally efficient, multi-scale convolutional modules |
| 2015 | **ResNet** (He et al.) introduces residual connections (covered in depth in the **Deep Learning** skill), enabling CNNs over 100 layers deep, dramatically improving image classification accuracy |
| 2017 | **EfficientNet** and related work formalize principled approaches to scaling CNN depth, width, and input resolution together for optimal efficiency |
| 2020 onward | **Vision Transformers (ViT)** demonstrate that Transformer architectures (covered in the **Transformers** skill), originally designed for language, can match or exceed CNN performance on image tasks given sufficient data, though CNNs remain dominant for many practical, especially smaller-data, use cases |

CNN history closely tracks the broader deep learning history — CNNs were quite literally the architecture whose 2012 breakthrough (AlexNet) launched deep learning's modern era, and their subsequent evolution (deeper via ResNet, more efficient via EfficientNet) directly mirrors and often pioneered techniques later adopted across the entire field.
`,

  "why-it-exists": `
CNNs exist because a generic, fully-connected neural network applied naively to raw image pixels faces two genuine, serious problems: first, the sheer number of parameters becomes enormous (a fully-connected layer connecting every pixel of even a modest image to every neuron in the next layer requires an impractically large number of weights), and second, and more fundamentally, a fully-connected network has NO built-in notion that nearby pixels are related, or that a useful visual pattern (like an edge) is equally useful to detect regardless of where in the image it appears — it would have to learn these facts, inefficiently, from scratch, effectively needing to see every possible position of every useful pattern separately during training.

CNNs solve both problems simultaneously through the convolution operation: a small, learnable filter is slid across the ENTIRE input, using the SAME weights at every spatial position (parameter sharing) — this directly encodes locality (the filter only looks at a small local neighborhood at a time) and translation invariance (the same filter, and therefore the same learned pattern-detector, is applied everywhere), while also dramatically reducing the number of parameters compared to a fully-connected alternative covering the same input size. This is precisely why CNNs so dramatically outperformed prior approaches (including generic fully-connected networks) for image-related tasks — the architecture itself directly encodes genuinely correct assumptions about the structure of spatial data.
`,

  "problem-it-solves": `
CNNs solve the **"how do we build a neural network that efficiently and effectively processes spatial data (especially images), detecting useful local patterns regardless of their position, without requiring an impractically large number of parameters"** problem.

Concretely, they provide:

- **Parameter efficiency via weight sharing**: a single convolutional filter's weights are reused across every spatial position in the input, dramatically reducing the total parameter count compared to a fully-connected layer covering the same input.
- **Translation invariance**: because the same filter is applied everywhere, a CNN can recognize a pattern (an edge, a texture, eventually an object) regardless of exactly where it appears in the image.
- **Hierarchical feature learning specifically suited to visual data**: stacking convolutional layers lets early layers detect simple, local features (edges, colors) while later layers combine them into increasingly complex, larger-scale features (shapes, object parts, whole objects) — directly mirroring the actual hierarchical structure present in real images.
- **Reduced spatial dimensionality via pooling**: pooling layers (typically max-pooling) reduce the spatial resolution of feature maps while retaining the most salient detected features, further improving parameter efficiency and providing a degree of additional translation invariance.

What CNNs do **not** solve, or solve only with genuine, unavoidable tradeoffs: CNNs' strong built-in assumptions (locality, translation invariance) are a genuine strength for typical image data but can be a limitation for tasks genuinely requiring long-range, global relationships across the entire image (a limitation that Vision Transformers, with their global attention mechanism covered in the **Transformers** and **Attention** skills, are specifically designed to address); and CNNs, like any deep architecture, still face the vanishing/exploding gradient challenges covered in the **Deep Learning** skill, requiring the same architectural solutions (residual connections, as demonstrated by ResNet) to train effectively at genuinely great depth.
`,

  "learning-objectives": `
By the end of this page you should be able to:

1. Explain the convolution operation and how it differs from a fully-connected layer.
2. Explain parameter sharing and translation invariance, and why they matter for image data.
3. Explain pooling layers and their role in reducing spatial dimensionality.
4. Explain the receptive field concept and how it grows across a CNN's layers.
5. Compare classic CNN architectures (LeNet, AlexNet, VGGNet, ResNet) and their key innovations.
6. Recognize CNN anti-patterns: inappropriate filter/stride/padding choices, ignoring receptive field size for the task, unnecessary fully-connected layers.
7. Compare CNNs to Vision Transformers and identify when each is the more appropriate choice.
8. Answer senior-level interview questions on convolution arithmetic and architectural design tradeoffs.
`,

  prerequisites: `
- **Required**: the **Neural Networks** and **Deep Learning** skills — CNNs are a specialized architecture built directly on this foundational neuron/layer/training framework.
- **Very helpful**: basic linear algebra for understanding the convolution operation's mathematics.

Dependency chain: **Neural Networks** → this page (CNNs) → **RNNs** → **Transformers** for the increasingly specialized architectures covered next in this category.
`,

  "beginner-concepts": `
### The convolution operation, intuitively

~~~
A small FILTER (e.g., 3x3 pixels) slides across the input
image, computing a weighted sum at each position (much like
a single neuron's weighted sum, but applied LOCALLY and
REPEATEDLY across the whole image using the SAME weights).

Input image (simplified 5x5) + a 3x3 filter -> produces a
smaller "feature map" showing WHERE in the image the pattern
this specific filter detects (e.g., a vertical edge) is present.
~~~

### A simple CNN layer (conceptual PyTorch-style)

~~~python
import torch.nn as nn

conv_layer = nn.Conv2d(in_channels=3, out_channels=16,
                        kernel_size=3, stride=1, padding=1)
pool_layer = nn.MaxPool2d(kernel_size=2, stride=2)

feature_map = pool_layer(relu(conv_layer(input_image)))
~~~

### Parameter sharing: why CNNs use so many fewer parameters

~~~
A fully-connected layer on a 224x224x3 image would require
MILLIONS of weights just for a single small hidden layer.
A convolutional layer with a 3x3 filter and 16 output channels
requires only 3*3*3*16 = 432 weights (plus biases) -- the
SAME 432 weights are reused at EVERY spatial position in the
image, a dramatic parameter reduction.
~~~

### Pooling: reducing spatial size while keeping important information

~~~
Max pooling: for each small region (e.g., 2x2), keep only
    the MAXIMUM value -- retaining the strongest detected
    feature in that region while reducing the feature map's
    spatial dimensions (e.g., halving both height and width).
~~~
`,

  "intermediate-concepts": `
### Stride and padding: controlling output size

~~~
Stride: how many pixels the filter moves between each
    application -- a stride of 2 skips every other position,
    producing a smaller output feature map than a stride of 1.
Padding: adding extra pixels (typically zeros) around the
    input's border, letting the filter be applied at the
    very edges without shrinking the output size unnecessarily
    -- "same" padding keeps output spatial size equal to input size.

Output size formula: output = floor((input + 2*padding - filter) / stride) + 1
~~~

### The receptive field: how much of the input a given neuron "sees"

~~~
A single neuron in the FIRST convolutional layer sees only
its filter's small local region (e.g., 3x3 pixels) of the
original input. A neuron in a LATER layer, built on top of
several earlier convolutional layers, effectively "sees" (has
in its receptive field) a much LARGER region of the original
input -- since it's built from earlier neurons that each
themselves saw a local region.
~~~

This growing receptive field across layers is precisely how CNNs achieve their hierarchical feature learning — early layers with small receptive fields detect simple, local patterns (edges), while later layers with much larger receptive fields can detect patterns spanning a much larger portion of the image (object parts, whole objects).

### Multiple channels and filters

~~~
A convolutional layer typically learns MANY different
filters simultaneously (e.g., 16, 64, or hundreds), each
producing its own feature map detecting a DIFFERENT pattern
-- one filter might detect vertical edges, another horizontal
edges, another a particular color transition -- collectively
forming a rich set of learned features passed to the next layer.
~~~

### Classic architectures and their key innovations

~~~
LeNet-5 (1998): an early, foundational CNN for digit recognition,
    establishing the conv-pool-conv-pool-fully-connected pattern.
AlexNet (2012): a much deeper, GPU-trained CNN, using ReLU
    activations and dropout, dramatically outperforming prior
    approaches on ImageNet.
VGGNet (2014): demonstrated that stacking many small (3x3)
    convolutional filters, rather than fewer larger ones,
    improves performance while keeping parameter count manageable.
ResNet (2015): introduced residual connections (covered in the
    Deep Learning skill), enabling CNNs over 100 layers deep.
~~~
`,

  "advanced-concepts": `
### 1x1 convolutions: channel-wise transformation without spatial mixing

~~~
A 1x1 convolutional filter doesn't look at any SPATIAL
neighborhood at all (its "receptive field" for this specific
operation is just a single pixel position) -- instead, it
combines information ACROSS CHANNELS at each position,
commonly used to reduce the number of channels (a
computational efficiency technique) before a more expensive,
larger convolution, popularized by GoogLeNet/Inception.
~~~

### Depthwise separable convolutions: a mobile/efficiency-focused technique

~~~
A standard convolution combines spatial filtering AND
cross-channel combination in one operation. A DEPTHWISE
SEPARABLE convolution splits this into two cheaper steps:
first, a spatial filter applied INDEPENDENTLY to each channel
(depthwise), then a 1x1 convolution combining channels
(pointwise) -- achieving similar representational power with
dramatically fewer parameters and computation, directly
enabling efficient architectures (MobileNet) for
resource-constrained (mobile/edge) deployment.
~~~

### Vision Transformers (ViT) versus CNNs: a genuine architectural alternative

~~~
Vision Transformers split an image into fixed-size patches,
treat each patch as a "token" (directly connecting to the
Transformers and Attention skills' own treatment of sequence
tokens), and apply GLOBAL self-attention across all patches
-- rather than CNNs' local, translation-invariant convolution.
ViTs can capture LONG-RANGE, global relationships across the
entire image more naturally than CNNs' inherently local filters,
but generally require substantially MORE training data to
match or exceed CNN performance, since ViTs lack CNNs' strong,
helpful built-in inductive biases (locality, translation
invariance) and must learn these patterns from data instead.
~~~

### Batch normalization's specific role in CNNs

~~~
Batch normalization (covered generally in the Deep Learning
skill) is applied PER CHANNEL in CNNs, normalizing each
feature map's activations across the batch -- particularly
important for CNNs given their typically very deep stacks of
convolutional layers, directly helping mitigate the vanishing/
exploding gradient problem at this architecture's characteristic scale.
~~~

### Data augmentation: exploiting translation invariance explicitly

~~~
Because CNNs are (partially) translation-invariant by design,
data augmentation techniques specifically exploiting spatial
transformations (random crops, flips, rotations, color
jittering) are especially effective and widely-used for
CNN training, effectively multiplying the useful training
data by generating plausible variations the network should
learn to treat equivalently.
~~~
`,

  "internal-working": `
Tracing a convolution operation concretely across a small input, illustrating exactly how a single filter produces a feature map:

~~~mermaid
flowchart TB
    subgraph Input["Input (5x5, simplified)"]
        direction TB
        Row1["1 1 1 0 0"]
        Row2["0 1 1 1 0"]
        Row3["0 0 1 1 1"]
        Row4["0 0 1 1 0"]
        Row5["0 1 1 0 0"]
    end
    Filter["3x3 Filter\n(learned weights,\ne.g., detects a\ndiagonal edge)"]
    Input --> Slide["Slide filter across every\nvalid 3x3 position,\ncomputing a weighted sum\nat each position"]
    Filter --> Slide
    Slide --> FeatureMap["Output Feature Map (3x3)\n-- shows WHERE this\nspecific pattern was detected"]
~~~

1. **The filter (a small grid of learned weights) is positioned at the top-left of the input.**
2. **A weighted sum is computed between the filter's weights and the corresponding input values** at that position (element-wise multiplication, then summed) — this is exactly the same weighted-sum computation as a single neuron in the **Neural Networks** skill, just applied to a small local patch rather than the entire input.
3. **The filter slides to the next position** (determined by the stride) and the computation repeats, producing the next value in the output feature map.
4. **This repeats across every valid position**, producing a complete feature map showing where in the input this specific filter's pattern is present.

**Why this matters**: this concrete trace demystifies convolution as fundamentally the SAME weighted-sum-plus-activation computation covered in the **Neural Networks** skill, just applied repeatedly across local spatial neighborhoods with SHARED weights — the genuine architectural innovation is this specific pattern of weight sharing and locality, not an entirely different underlying computation.
`,

  architecture: `
A senior CNN practitioner thinks about architecture in terms of choosing appropriate filter sizes/strides/padding for the task, managing receptive field growth deliberately, and choosing between CNNs and Vision Transformers based on data scale and task requirements.

### Choosing filter size, stride, and padding

~~~mermaid
flowchart TB
    Design["Convolutional layer design"] --> Q1{"Need to preserve\nspatial resolution?"}
    Q1 -->|Yes| SamePadding["Use 'same' padding\n(stride=1, padding sized\nto keep output = input size)"]
    Q1 -->|"No -- want to\nreduce spatial size"| Downsample["Use stride > 1,\nor a subsequent\npooling layer"]
~~~

### Managing receptive field growth deliberately

A senior practitioner ensures the network's final layers have a receptive field large enough to capture the full scale of the relevant pattern for the task — recognizing a small local texture needs only a modest receptive field, while recognizing a whole object typically requires a receptive field spanning a substantial fraction of the input image, achieved by stacking enough convolutional (and pooling) layers.

### Choosing between CNNs and Vision Transformers

~~~mermaid
flowchart TB
    Task["An image-related task"] --> Q{"Abundant training data\n(millions of images)\navailable?"}
    Q -->|Yes| ViTOption["Vision Transformer is a\ngenuinely strong option,\ncapturing global relationships"]
    Q -->|"No -- limited\ntraining data"| CNNOption["CNN's strong built-in\ninductive biases (locality,\ntranslation invariance)\ngenerally perform better\nwith less data"]
`,

  "data-flow": `
Tracing an image's journey through a typical CNN architecture, from raw pixels to a final classification:

~~~mermaid
sequenceDiagram
    participant Image as Raw Input Image
    participant Conv1 as Conv Layer 1 + ReLU + Pool
    participant Conv2 as Conv Layer 2 + ReLU + Pool
    participant Conv3 as Conv Layer 3 + ReLU + Pool
    participant Flatten as Flatten
    participant FC as Fully-Connected Layer
    participant Output as Softmax Output

    Image->>Conv1: raw pixels (e.g., 224x224x3)
    Conv1->>Conv1: detect simple features\n(edges, colors)
    Conv1->>Conv2: smaller feature maps,\nmore channels
    Conv2->>Conv2: detect combined patterns\n(textures, simple shapes)
    Conv2->>Conv3: even smaller feature maps,\neven more channels
    Conv3->>Conv3: detect complex, abstract\nfeatures (object parts)
    Conv3->>Flatten: final feature maps\nflattened into a vector
    Flatten->>FC: fully-connected layer(s)\ncombine flattened features
    FC->>Output: softmax produces final\nclass probabilities
~~~

The critical detail: as data flows through successive convolutional layers, the SPATIAL dimensions typically shrink (via stride/pooling) while the number of CHANNELS typically grows — trading spatial resolution for an increasingly rich, abstract set of detected features at each position, precisely mirroring the hierarchical feature learning covered throughout this page.
`,

  "production-usage": `
### A representative CNN architecture definition (conceptual PyTorch-style)

~~~python
import torch.nn as nn

class SimpleCNN(nn.Module):
    def __init__(self, num_classes):
        super().__init__()
        self.features = nn.Sequential(
            nn.Conv2d(3, 32, kernel_size=3, padding=1), nn.ReLU(),
            nn.MaxPool2d(2),
            nn.Conv2d(32, 64, kernel_size=3, padding=1), nn.ReLU(),
            nn.MaxPool2d(2),
        )
        self.classifier = nn.Linear(64 * 56 * 56, num_classes)

    def forward(self, x):
        x = self.features(x)
        x = x.flatten(1)
        return self.classifier(x)
~~~

### Non-negotiables for production CNN usage

1. **Default to transfer learning from a pretrained CNN** (ResNet, EfficientNet) rather than training from scratch, directly reusing the **Deep Learning** skill's own transfer learning guidance.
2. **Use appropriate data augmentation** (crops, flips, color jittering) exploiting the task's genuine invariances.
3. **Choose an architecture with adequate receptive field** for the scale of patterns relevant to the task.
4. **Use batch normalization** for genuinely deep CNN stacks, directly aiding stable gradient flow.
5. **Consider Vision Transformers specifically when abundant training data is available** and global, long-range relationships genuinely matter for the task.

### Common production patterns

- **Fine-tuning a pretrained ResNet or EfficientNet** for a specific image classification/detection task.
- **CNN-based vision encoders in multimodal models**, extracting visual features combined with text (directly connecting to modern vision-language AI systems).
- **Depthwise separable convolutions (MobileNet-style)** for resource-constrained mobile/edge deployment.
`,

  "industry-examples": `
- **AlexNet, VGGNet, ResNet, EfficientNet**: landmark CNN architectures, each introducing genuine, still-influential architectural innovations.
- **Autonomous vehicle perception systems**: rely heavily on CNNs for real-time object detection and scene understanding from camera input.
- **Medical imaging diagnosis systems**: widely use fine-tuned CNNs for detecting anomalies in X-rays, MRIs, and other medical images.
- **Facial recognition and biometric systems**: commonly built on CNN-based feature extraction.
- **MobileNet and EfficientNet**: purpose-built for efficient, resource-constrained deployment on mobile and edge devices.
`,

  "best-practices": `
1. **Default to transfer learning from a pretrained CNN** rather than training from scratch.
2. **Use appropriate data augmentation** exploiting the task's genuine spatial invariances.
3. **Ensure adequate receptive field size** for the scale of patterns relevant to the task, via sufficient depth/pooling.
4. **Use batch normalization** for deep CNN stacks, aiding stable training.
5. **Use residual connections** for genuinely deep CNN architectures, directly reusing the **Deep Learning** skill's own guidance.
6. **Choose filter size, stride, and padding deliberately**, understanding their direct effect on output size and receptive field growth.
7. **Consider depthwise separable convolutions** for resource-constrained deployment scenarios.
8. **Consider Vision Transformers specifically when data is abundant** and global relationships matter, rather than defaulting to CNNs universally.
`,

  "anti-patterns": `
### Using an inadequate receptive field for the task

~~~
# WRONG — a shallow CNN with only 1-2 convolutional layers
# applied to a task requiring recognition of large-scale,
# whole-object patterns, when its neurons' receptive fields
# are far too small to ever "see" the full relevant pattern
# RIGHT — ensure sufficient depth (and appropriate stride/
# pooling) so later layers' receptive fields span a large
# enough portion of the input for the task's actual patterns
~~~

### Training a CNN from scratch when transfer learning would clearly suffice

~~~
# WRONG — training a large CNN entirely from scratch on a
# comparatively small, task-specific image dataset
# RIGHT — fine-tune a pretrained CNN (ResNet, EfficientNet),
# directly reusing the Deep Learning skill's transfer learning guidance
~~~

### Unnecessary, oversized fully-connected layers after convolutional layers

~~~
# WRONG — flattening a large final feature map directly into
# an enormous fully-connected layer, reintroducing the
# parameter-explosion problem CNNs are specifically designed
# to avoid
# RIGHT — use global average pooling (averaging each channel's
# entire feature map into a single value) before a much smaller
# final fully-connected layer, a common modern practice
# significantly reducing parameter count
~~~

### Other production-grade anti-patterns

- **Ignoring data augmentation opportunities** for tasks genuinely invariant to spatial transformations (rotation, flipping, cropping).
- **Not using batch normalization in deep CNN stacks**, risking unstable training.
- **Defaulting to a Vision Transformer despite limited training data**, when a CNN's stronger built-in inductive biases would likely perform better with less data.
`,

  performance: `
### Rule zero: parameter sharing is the core reason CNNs are so much more efficient than fully-connected networks for image data

The same small filter's weights are reused across every spatial position, dramatically reducing parameter count and computation compared to a fully-connected alternative covering the same input.

### The performance hierarchy (apply in order)

1. **Use transfer learning from a pretrained CNN**, dramatically reducing training data/compute needs.
2. **Use global average pooling** rather than a large fully-connected layer before the final classification layer, reducing parameter count significantly.
3. **Consider depthwise separable convolutions** for resource-constrained deployment, trading a small amount of representational power for substantially reduced computation.
4. **Use appropriate data augmentation** to effectively increase training data without additional data collection cost.
5. **Profile actual GPU utilization and inference latency** for the chosen architecture, verifying it meets genuine production requirements.

### Micro-level facts worth knowing

- 1x1 convolutions (channel-wise only, no spatial mixing) are a computationally cheap way to reduce channel count before a more expensive larger convolution, a technique popularized by GoogLeNet/Inception.
- Depthwise separable convolutions achieve similar representational power to standard convolutions with dramatically fewer parameters and FLOPs, directly enabling efficient mobile-deployment architectures like MobileNet.
- Global average pooling (averaging each channel's entire feature map to a single value) before the final classification layer significantly reduces parameter count compared to flattening into a large fully-connected layer, and is standard practice in most modern CNN architectures.
`,

  scalability: `
CNNs' parameter-sharing architecture directly enables scaling to process high-resolution images without a proportional explosion in parameter count, unlike a naive fully-connected approach.

### How CNNs scale with image resolution and dataset size

~~~mermaid
flowchart LR
    HigherResolution["Higher-resolution\ninput images"] --> ParameterSharing["Parameter sharing keeps\nfilter count constant\nregardless of input size"]
    ParameterSharing --> ScalableProcessing["Computation scales with\nimage AREA, not with an\nexploding parameter count"]
~~~

### Known ceilings and answers

| Bottleneck | Answer |
|------------|--------|
| Insufficient receptive field for large-scale patterns | Add more layers/pooling, or use dilated convolutions to grow receptive field faster |
| Training from scratch requiring more data/compute than available | Use transfer learning from a pretrained CNN |
| Excessive computation for resource-constrained deployment | Use depthwise separable convolutions (MobileNet-style) |
| Task requiring genuinely global, long-range relationships across the image | Consider a Vision Transformer, given sufficient training data |
`,

  security: `
### CNN-specific adversarial vulnerability

~~~
CNNs are well-documented to be vulnerable to ADVERSARIAL
EXAMPLES -- small, often visually imperceptible pixel
perturbations specifically crafted to cause a confidently
WRONG classification, directly connecting to the general
adversarial example concern covered in the Deep Learning skill,
but particularly well-studied and demonstrated for CNN-based
image classifiers specifically.
~~~

### Essential CNN-related security practices

1. **Consider adversarial robustness testing** for CNNs deployed in genuinely security-sensitive contexts (autonomous vehicles, biometric authentication, content moderation).
2. **Validate and sanitize image inputs**, treating them as untrusted, directly reusing the **Deep Learning** skill's own input-validation guidance.
3. **Be aware of data poisoning risk** in training pipelines for CNN-based systems trained on user-contributed images.

See the **Deep Learning** and **Machine Learning** skills for the broader security context this connects to, and the platform's later **AI Red Teaming** skill for adversarial testing methodology.
`,

  testing: `
### Testing convolution output shape correctness

~~~python
def test_conv_output_shape():
    conv = nn.Conv2d(3, 16, kernel_size=3, stride=1, padding=1)
    output = conv(torch.randn(1, 3, 224, 224))
    assert output.shape == (1, 16, 224, 224)  # "same" padding preserves spatial size
~~~

### Testing translation invariance behavior

~~~python
def test_shifted_input_produces_similar_detected_features():
    original_output = model(original_image)
    shifted_output = model(shift_image(original_image, pixels=5))
    assert features_are_similar(original_output, shifted_output)
~~~

### The senior testing doctrine

- Test convolutional layer output shapes explicitly against the expected formula, especially after changing stride/padding/filter size.
- Test data augmentation pipelines explicitly, verifying augmented images remain valid, correctly-labeled examples.
- Test model behavior under known adversarial perturbation techniques for security-sensitive deployments.
- Test transfer learning setup correctness (frozen vs. trainable layers) before a long fine-tuning run.
`,

  debugging: `
### The toolbox, in escalation order

1. **Check output feature map shapes at each layer first** when a CNN's architecture doesn't behave as expected, verifying stride/padding calculations are correct.
2. **Visualize learned filters and feature maps** (particularly in early layers) to sanity-check that the network is learning sensible, interpretable low-level features (edges, colors).
3. **Check receptive field size** if the model seems to systematically miss larger-scale patterns despite otherwise reasonable training.
4. **Check for data augmentation correctness** if validation performance is poor despite reasonable training loss, verifying augmented images remain correctly labeled.

### Debugging common CNN-related symptoms

- "Output feature map size doesn't match expectations" — recheck the stride/padding/filter-size formula for that specific layer.
- "Model fails to recognize large-scale objects/patterns" — check whether the network's final layers have an adequate receptive field for the task.
- "Early-layer filters look like random noise rather than sensible edge/color detectors" — may indicate a genuine training problem (poor initialization, learning rate, or insufficient training).
- "Validation performance poor despite good training loss" — check for overfitting, or a data augmentation bug producing incorrectly-labeled augmented examples.
`,

  monitoring: `
### Key signals to track

- **Training and validation loss/accuracy curves**, the primary diagnostic for CNN training health, directly reusing the **Deep Learning** skill's own monitoring guidance.
- **Per-layer feature map statistics**, useful for diagnosing dead filters or unstable activations in specific layers.
- **Inference latency and throughput**, particularly important for CNN-based systems deployed in real-time contexts (autonomous vehicles, video processing).

### Tools

Framework-native visualization tools (PyTorch hooks, TensorBoard) for inspecting learned filters and feature maps; standard experiment tracking for logging training metrics; specialized CNN interpretability tools (Grad-CAM and similar) for visualizing which image regions most influenced a given prediction.

### Alerting priorities

Alert on training loss diverging or failing to decrease (directly reusing the **Deep Learning** skill's own guidance), and on inference latency exceeding acceptable thresholds for real-time deployment contexts.
`,

  deployment: `
### A representative CNN deployment pattern with appropriate preprocessing

~~~python
model.eval()
with torch.no_grad():
    preprocessed = preprocess(raw_image)  # resize, normalize
    logits = model(preprocessed.unsqueeze(0))
    prediction = torch.softmax(logits, dim=-1)
~~~

Ensuring the EXACT same preprocessing (resizing, normalization statistics) used during training is faithfully applied at inference time is a genuinely common, easy-to-overlook source of production bugs — a mismatch here can silently degrade performance without any obvious error.

### CI/CD pipeline considerations

Treat the CNN architecture, trained weights, AND the exact preprocessing pipeline as jointly version-controlled, reproducible artifacts. See the **Deep Learning** skill and the platform's MLOps category for the general deployment depth this builds on.
`,

  "production-checklist": `
Before a production CNN takes real predictions:

- [ ] Transfer learning used from a pretrained CNN where practical, rather than training from scratch
- [ ] Appropriate data augmentation applied during training, matched to the task's genuine invariances
- [ ] Receptive field verified adequate for the scale of patterns relevant to the task
- [ ] Batch normalization and residual connections used for genuinely deep architectures
- [ ] Global average pooling (rather than an oversized fully-connected layer) used before the final classification layer
- [ ] Exact training-time preprocessing (resizing, normalization) faithfully reproduced at inference time
- [ ] Adversarial robustness considered for genuinely security-sensitive deployment contexts
`,

  "common-mistakes": `
1. **Using an inadequate receptive field for the task's actual pattern scale**, missing larger-scale features entirely.
2. **Training from scratch when transfer learning would clearly suffice**, wasting data and compute unnecessarily.
3. **Using an oversized fully-connected layer after flattening**, reintroducing the parameter-explosion problem CNNs are meant to avoid.
4. **Mismatching training-time and inference-time preprocessing**, silently degrading production performance.
5. **Not using data augmentation for tasks genuinely invariant to spatial transformations.**
6. **Defaulting to a Vision Transformer despite limited training data**, when a CNN's inductive biases would likely perform better.
`,

  "common-errors": `
| Error | Typical Cause | Fix |
|-------|---------------|-----|
| Output feature map size doesn't match expectation | Incorrect stride/padding calculation | Recheck the output-size formula for that layer |
| Model fails on larger-scale patterns despite good training loss | Insufficient receptive field | Add depth/pooling, or use dilated convolutions |
| Production performance much worse than validation | Mismatched preprocessing between training and inference | Ensure identical resizing/normalization at both stages |
| Excessive parameter count / slow training | Oversized fully-connected layer after flattening | Use global average pooling before a smaller final layer |
| Poor performance on a small, specialized dataset | Training from scratch instead of using transfer learning | Fine-tune a pretrained CNN instead |
| Model highly sensitive to small, imperceptible input perturbations | Adversarial vulnerability, inherent to standard CNN training | Consider adversarial training/robustness testing for security-sensitive contexts |
`,

  faqs: `
**What is a convolution, and how does it differ from a fully-connected layer?**
A convolution slides a small, learnable filter across the input, computing a weighted sum at each position using the SAME filter weights everywhere (parameter sharing); a fully-connected layer instead connects every input value to every output neuron with entirely separate weights — convolution is dramatically more parameter-efficient and directly encodes locality and translation invariance for spatial data.

**What is translation invariance, and why does it matter for images?**
The property that a pattern (like an edge or an object) is recognized regardless of exactly where it appears in the image — it matters because a useful visual pattern is equally worth detecting no matter its position, and a CNN's weight-sharing directly provides this property, while a generic fully-connected network would have to learn it inefficiently from scratch.

**What does pooling do, and why is it used?**
Pooling (typically max-pooling) reduces a feature map's spatial dimensions while retaining the strongest detected features, improving parameter efficiency in later layers and providing some additional translation invariance.

**What is the receptive field, and why does it grow across layers?**
The region of the original input that a given neuron's output is influenced by — it grows across layers because a neuron in a later layer is built on top of earlier neurons, each of which already "saw" their own local region, so later neurons effectively "see" a progressively larger portion of the original input.

**Should I use a CNN or a Vision Transformer for my image task?**
CNNs' strong built-in inductive biases (locality, translation invariance) generally perform better with limited training data; Vision Transformers can match or exceed CNN performance and better capture global, long-range relationships, but generally require substantially more training data to do so, since they lack CNNs' helpful built-in assumptions and must learn them from data instead.

**What are depthwise separable convolutions, and why are they used?**
A technique splitting a standard convolution into a cheaper spatial (depthwise) step and a cheaper channel-combining (pointwise/1x1) step, achieving similar representational power with dramatically fewer parameters and less computation — directly enabling efficient architectures like MobileNet for resource-constrained mobile/edge deployment.
`,

  "interview-questions": `
### Junior level

1. **What is a convolution operation?**
   Model answer: a small, learnable filter slid across the input, computing a weighted sum at each position, using the same filter weights everywhere (parameter sharing).

2. **What is pooling, and why is it used?**
   Model answer: a technique (typically max-pooling) that reduces a feature map's spatial dimensions while retaining its strongest detected features, improving efficiency and adding some translation invariance.

3. **What is translation invariance?**
   Model answer: the property that a CNN recognizes a pattern regardless of where it appears in the image, a direct consequence of using the same filter weights at every spatial position.

4. **Why do CNNs use far fewer parameters than an equivalent fully-connected network on the same image?**
   Model answer: because a convolutional filter's weights are shared (reused) across every spatial position, rather than every input pixel needing its own separate connection to every output neuron.

### Senior level

5. **Explain the receptive field concept precisely, and describe how you would design a CNN architecture to ensure adequate receptive field for detecting whole objects, not just small local textures.**
   Model answer: the receptive field of a given neuron is the region of the ORIGINAL input image that its output value is influenced by; a neuron in the first convolutional layer has a receptive field exactly equal to its filter's size (e.g., 3x3 pixels), while a neuron in a later layer has a much larger effective receptive field, since it's computed from earlier neurons that each themselves had their own (smaller) receptive fields — receptive field size grows with network depth and is also directly affected by stride and pooling (both of which effectively increase the receptive field growth rate per layer, since they downsample the spatial resolution the next layer operates on); to ensure adequate receptive field for whole-object recognition, a practitioner would ensure sufficient depth (enough stacked layers) and appropriate use of stride/pooling, verifying (often by direct calculation, tracing filter size/stride/padding through each layer) that the final layers' receptive field spans a substantial fraction of the input image's actual spatial extent — an architecture with too few layers or too small filters relative to the input image size risks having even its deepest neurons only ever "see" a small local region, fundamentally unable to detect patterns spanning a larger portion of the image no matter how well-trained.

6. **Compare CNNs and Vision Transformers, explaining the specific architectural tradeoff each represents and when you would choose one over the other.**
   Model answer: CNNs encode strong, helpful built-in INDUCTIVE BIASES specifically suited to typical image data — locality (nearby pixels are related) via small local filters, and translation invariance (a pattern is equally useful anywhere) via weight sharing — these biases mean CNNs can learn effective representations from comparatively LESS training data, since the architecture itself already "knows" these generally-true facts about images rather than needing to learn them from data; Vision Transformers instead treat an image as a sequence of patches and apply GLOBAL self-attention across all of them, with NO built-in locality or translation-invariance assumption at all — this gives ViTs the flexibility to learn genuinely global, long-range relationships across the entire image more naturally than a CNN's inherently local filters can, but this flexibility comes at the cost of needing to LEARN even the basic, generally-true patterns (like locality) that a CNN gets "for free" from its architecture, requiring substantially MORE training data to reach comparable or superior performance; the practical decision hinges directly on available training data scale — CNNs (or transfer learning from a pretrained CNN) for limited-data scenarios, ViTs (typically also via transfer learning from a model pretrained on a very large dataset) when abundant data and genuinely global relationships are both relevant to the task.

7. **A CNN's training loss is decreasing normally, but the model performs poorly at test time on images where the object of interest appears in a corner or at an unusual scale compared to training images. Diagnose the likely cause.**
   Model answer: this pattern suggests the model may not have learned genuinely scale/position-robust features, despite CNNs' theoretical translation invariance — a likely cause is insufficient DATA AUGMENTATION during training (if training images consistently show the object centered and at a similar scale, the network has limited incentive/opportunity to learn features robust to different positions/scales, even though its architecture technically supports translation invariance for FEATURES it has actually learned); the fix is to apply meaningful data augmentation during training — random crops, scaling, and translations — specifically exposing the network to the object at varied positions and scales, directly teaching it (through the training data distribution itself, complementing rather than replacing the architecture's inherent translation invariance) to recognize the pattern robustly across these variations; a secondary, related consideration is whether the network's receptive field and pooling structure are appropriate for detecting the object at the SMALLER scales it might appear at in the corner/distant cases, which might require additional multi-scale architectural considerations (like feature pyramid networks) for genuinely robust performance across a wide range of object scales.

8. **Explain how residual connections (from ResNet) specifically benefit very deep CNN architectures, connecting this to the general vanishing gradient problem covered in the Deep Learning skill.**
   Model answer: as covered in the **Deep Learning** skill, the vanishing gradient problem causes the error signal to shrink exponentially as it backpropagates through many layers, meaning early layers of a very deep network can receive a vanishingly small gradient and effectively stop learning; ResNet's residual connections directly address this by adding a layer's (or block's) input directly to its output, giving the gradient a direct, unimpeded "shortcut" path backward through the network that bypasses the multiplicative shrinkage otherwise compounding across many stacked convolutional layers; this specific innovation was what enabled CNNs with over 100 layers to train successfully for the first time, directly demonstrating that a general deep learning principle (residual connections addressing vanishing gradients) applies concretely and powerfully to the CNN architecture specifically, not just to generic fully-connected networks.

9. **Design a CNN-based system for classifying product images on an e-commerce platform, where the product catalog grows continuously and new product categories are added regularly.**
   Model answer: use transfer learning from a strong pretrained CNN (ResNet or EfficientNet) as the foundation, replacing and training only the final classification layer(s) initially on the current product catalog's labeled images, directly reusing the **Deep Learning** skill's transfer learning guidance to minimize data/compute requirements; apply meaningful data augmentation (rotations, crops, lighting variation) reflecting the genuine variability in how product photos might be taken; design the system architecture to support adding NEW product categories over time WITHOUT requiring a full retrain from scratch — a common practical approach is periodically fine-tuning the model on the updated, expanded catalog (potentially unfreezing a few additional pretrained layers as the total available task-specific data grows over time), or maintaining a separate, smaller "new category" classifier that's periodically merged into the main model during a scheduled retraining cycle; monitor classification accuracy per category continuously in production, since new or rapidly-changing product categories may show degraded performance until sufficient labeled examples and a subsequent retraining cycle are available.

10. **How would you decide whether to use standard convolutions or depthwise separable convolutions for a new CNN-based mobile application?**
    Model answer: the decision hinges on the actual deployment constraints — if the application must run efficiently on resource-constrained mobile/edge hardware with real, meaningful limits on compute, memory, and battery usage, depthwise separable convolutions (as used in MobileNet-style architectures) are a strong, deliberate choice, since they achieve similar representational power to standard convolutions with dramatically fewer parameters and FLOPs, directly trading a modest amount of representational capacity for substantially reduced computational cost; if the application instead runs in a less resource-constrained environment (a cloud-based backend service, for instance, where the image is uploaded and processed server-side), standard convolutions (potentially via a larger, more capable pretrained model like ResNet or EfficientNet) may be preferable, since the computational savings of depthwise separable convolutions matter less when compute isn't the binding constraint, and the potentially higher representational capacity of standard convolutions could provide meaningfully better accuracy for a task where that tradeoff is worth making.
`,

  "coding-questions": `
### 1. Implement a 2D convolution operation from scratch

~~~python
import numpy as np

def conv2d(input_matrix, filter_matrix, stride=1, padding=0):
    if padding > 0:
        input_matrix = np.pad(input_matrix, padding)
    fh, fw = filter_matrix.shape
    ih, iw = input_matrix.shape
    oh = (ih - fh) // stride + 1
    ow = (iw - fw) // stride + 1
    output = np.zeros((oh, ow))
    for i in range(oh):
        for j in range(ow):
            region = input_matrix[i*stride:i*stride+fh, j*stride:j*stride+fw]
            output[i, j] = np.sum(region * filter_matrix)
    return output
# Follow-up: verify the output shape matches the standard
# formula output = floor((input + 2*padding - filter) / stride) + 1
# for several different stride/padding/filter combinations.
~~~

### 2. Implement max pooling

~~~python
import numpy as np

def max_pool2d(input_matrix, pool_size=2, stride=2):
    ih, iw = input_matrix.shape
    oh = (ih - pool_size) // stride + 1
    ow = (iw - pool_size) // stride + 1
    output = np.zeros((oh, ow))
    for i in range(oh):
        for j in range(ow):
            region = input_matrix[i*stride:i*stride+pool_size, j*stride:j*stride+pool_size]
            output[i, j] = np.max(region)
    return output
# Follow-up: how does max pooling's output change (or not
# change) if the input is shifted by 1 pixel -- what does this
# tell you about pooling's contribution to translation invariance?
~~~

### 3. Calculate receptive field size across stacked layers

~~~python
def calculate_receptive_field(layer_configs):
    # each config: (filter_size, stride)
    receptive_field = 1
    total_stride = 1
    for filter_size, stride in layer_configs:
        receptive_field += (filter_size - 1) * total_stride
        total_stride *= stride
    return receptive_field
# Follow-up: given layer_configs = [(3,1), (3,1), (2,2), (3,1)],
# calculate the final receptive field, and explain why the
# pooling layer's stride affects the growth rate of all
# SUBSEQUENT layers' contribution to the receptive field.
~~~
`,

  "hands-on-labs": `
### Lab 1 (Beginner): Implement convolution and pooling from scratch, then verify against a framework
Implement 2D convolution and max pooling from scratch in NumPy, then verify your implementation's output matches PyTorch's nn.Conv2d and nn.MaxPool2d for the same inputs and parameters. Deliverable: verified from-scratch implementations. Skills exercised: convolution/pooling mechanics.

### Lab 2 (Intermediate): Build and train a small CNN for image classification
Build a small CNN (a few convolutional layers plus pooling and a final classifier) using a framework like PyTorch, train it on a standard dataset (e.g., CIFAR-10), and visualize learned first-layer filters. Deliverable: a trained CNN with visualized learned filters. Skills exercised: applied CNN training and interpretability.

### Lab 3 (Advanced): Implement transfer learning with a pretrained CNN
Load a pretrained CNN (ResNet), freeze early layers, fine-tune on a smaller, task-specific dataset, and compare performance/training time against training an equivalent architecture from scratch. Deliverable: a documented comparison demonstrating transfer learning's benefit. Skills exercised: CNN transfer learning.

### Lab 4 (Production): Calculate and verify receptive field size for a real architecture
Given a real, moderately deep CNN architecture's layer configuration (filter sizes, strides, pooling), calculate the receptive field size of its final layer by hand, then verify this calculation empirically by observing which input regions actually influence a given output neuron. Deliverable: a documented receptive field calculation with empirical verification. Skills exercised: applied receptive field analysis.
`,

  "real-projects": `
### 1. A fine-tuned image classification system for a specialized visual domain
Engineering requirements: transfer learning from a pretrained CNN, appropriate data augmentation, and a training pipeline supporting periodic retraining as new categories are added.

### 2. A resource-constrained, mobile-deployed image classifier
Engineering requirements: depthwise separable convolutions (MobileNet-style architecture), quantization/compression appropriate for mobile hardware, and careful latency/accuracy tradeoff tuning.

### 3. A CNN interpretability and debugging toolkit
Engineering requirements: visualization of learned filters and feature maps, Grad-CAM-style saliency mapping showing which image regions most influenced a given prediction, and receptive field calculation utilities.
`,

  "case-studies": `
### AlexNet's specific CNN architecture choices as deep learning's watershed moment
AlexNet's 2012 ImageNet win wasn't just about using a CNN — it combined a genuinely deep CNN architecture with then-novel choices (ReLU activations instead of sigmoid/tanh, dropout regularization, GPU-based training) that together produced a dramatic performance leap over prior approaches, directly launching deep learning's modern era. Lesson: a landmark breakthrough often results from combining SEVERAL individually-important innovations (architecture, activation function, regularization, hardware) simultaneously, rather than any single change alone.

### VGGNet's demonstration that architectural simplicity (small, stacked filters) can outperform complexity
VGGNet's key finding — that stacking many small (3x3) convolutional filters could match or exceed the performance of architectures using fewer, larger filters, while using comparable or fewer parameters — provided an influential, simplifying architectural principle that shaped CNN design for years afterward. Lesson: a rigorously demonstrated, simple architectural principle (smaller, stacked filters) can sometimes outperform and simplify more complex alternatives, a genuinely valuable, hard-won empirical lesson rather than an obvious a priori assumption.

### Vision Transformers' emergence as a genuine, data-dependent alternative to CNNs
The 2020 Vision Transformer paper's finding that Transformers could match or exceed CNN performance on image tasks, but ONLY given sufficiently large training datasets, provided a nuanced, important lesson about the genuine tradeoff between an architecture's built-in inductive biases (CNNs' locality/translation-invariance) and its flexibility (ViTs' lack of these biases, requiring more data to learn equivalent patterns from scratch). Lesson: a new architecture's genuine superiority is often conditional on specific circumstances (here, abundant training data) rather than a simple, universal replacement — understanding these conditions is essential for making the right architectural choice for a specific, real situation.
`,

  comparisons: `
| Aspect | Fully-Connected Layer | Convolutional Layer |
|--------|----------------------------|--------------------------|
| Parameter sharing | None — every connection has its own weight | Same filter weights reused across all spatial positions |
| Locality | No built-in notion of spatial locality | Filters only look at a small local neighborhood |
| Translation invariance | None, must be learned inefficiently | Built-in, via weight sharing |
| Best fit | Non-spatial data, or final classification layers | Spatial data (images, and similar grid-structured data) |

| Aspect | CNN | Vision Transformer (ViT) |
|--------|---------|------------------------------|
| Inductive bias | Strong (locality, translation invariance) | Weak/none — learns relationships from data |
| Data efficiency | Better with limited data | Requires substantially more data for comparable performance |
| Long-range relationships | Limited by receptive field growth | Naturally global, via self-attention across all patches |
| Modern status | Still dominant for many practical, especially smaller-data, use cases | Increasingly competitive with sufficient data/compute |

**How seniors choose**: default to CNNs (typically via transfer learning) for most practical image tasks, especially with limited training data; consider Vision Transformers specifically when abundant training data is available and genuinely global, long-range image relationships matter for the task.
`,

  "related-technologies": `
- **Neural Networks**, **Deep Learning** — the foundational building blocks and training dynamics CNNs build directly on.
- **RNNs**, **Transformers** — alternative specialized architectures for sequential data, covered next in this category.
- **Attention** — the mechanism underlying Vision Transformers, a genuine architectural alternative to CNNs for image tasks.
- **Vector Search** — CNN-extracted image features (embeddings) are commonly indexed for similarity search, directly connecting to this category's later coverage.

Learning path: **Neural Networks** → **Deep Learning** → this page (CNNs) → **RNNs** → **Transformers** for the increasingly specialized architectures covered next.
`,

  "latest-updates": `
Knowledge cutoff for this page: January 2026. As of that cutoff:

- Vision Transformers continue to gain adoption for large-scale, data-abundant image tasks, while CNNs (especially via transfer learning) remain dominant for many practical, smaller-data use cases.
- Continued refinement of efficient CNN architectures (EfficientNet-style principled scaling, MobileNet-style depthwise separable convolutions) for resource-constrained deployment.
- Growing use of hybrid CNN-Transformer architectures, combining CNNs' efficient local feature extraction with Transformers' global relationship modeling.
- Given continued evolution in this space, verify current best-practice architecture recommendations against up-to-date research and framework documentation.
`,

  "future-roadmap": `
Where CNN technology is heading, and what's worth betting career time on:

- **Continued coexistence of CNNs and Vision Transformers**, each favored for different data-scale and task-requirement combinations rather than one fully displacing the other.
- **Continued growth of efficient CNN architectures** for mobile/edge deployment, as on-device AI inference becomes increasingly important.
- **Continued relevance of CNN-based vision encoders** within broader multimodal AI systems, even as the overall architecture landscape evolves.
- **What to bet on**: deeply understanding convolution, receptive fields, and the locality/translation-invariance inductive biases — these transfer directly to reasoning about any spatial-data architecture, including hybrid CNN-Transformer approaches, a far more durable investment than familiarity with any single current architecture alone.
`,

  "cheat-sheet": `
~~~
# ---- Convolution: the core operation ----
Small filter slides across input, SAME weights at every
    position (parameter sharing) -> detects a pattern
    regardless of its position (translation invariance).
output_size = floor((input + 2*padding - filter) / stride) + 1
~~~

~~~
# ---- Pooling ----
Max pooling: keep the MAX value in each small region ->
    reduces spatial size, retains strongest features,
    adds some translation invariance.
~~~

~~~
# ---- Receptive field ----
Grows across layers -- a later-layer neuron "sees" a much
    larger region of the original input than an early-layer
    neuron. Ensure enough depth/pooling for the task's
    actual pattern scale (whole objects vs local textures).
~~~

~~~
# ---- Classic architectures ----
LeNet-5:    early conv-pool pattern (1998)
AlexNet:    deep + ReLU + dropout + GPUs (2012, the breakthrough)
VGGNet:     many small (3x3) stacked filters > few large ones
ResNet:     residual connections -> 100+ layers deep
~~~

~~~
# ---- Efficiency techniques ----
1x1 convolutions: channel-wise mixing, no spatial mixing
    (cheap, reduces channels before an expensive conv)
Depthwise separable convolutions: split spatial + channel
    steps -> MobileNet-style efficient mobile deployment
Global average pooling: replaces large FC layer, cuts params
~~~

~~~
# ---- CNN vs Vision Transformer ----
CNN: strong built-in locality/translation-invariance bias ->
    better with LIMITED data
ViT: no built-in bias, global attention -> needs MORE data
    to match/beat CNN performance
~~~
`,

  "flash-cards": `
| Question | Answer |
|----------|--------|
| What is parameter sharing in CNNs? | Same filter weights reused across every spatial position. |
| What is translation invariance? | Recognizing a pattern regardless of its position in the image. |
| What does max pooling do? | Keeps the max value per region — reduces size, retains strongest features. |
| What is the receptive field? | The region of the original input a given neuron's output depends on. |
| Why does receptive field grow with depth? | Later neurons are built from earlier neurons that each saw their own local region. |
| Key innovation of ResNet for CNNs? | Residual connections — enabled 100+ layer deep networks. |
| Key finding of VGGNet? | Many small (3x3) stacked filters can outperform fewer large ones. |
| What are depthwise separable convolutions for? | Efficient mobile/edge deployment — split spatial + channel steps. |
| CNN vs ViT — who needs more data? | ViT — lacks CNN's built-in locality/translation-invariance bias. |
| What replaces a large FC layer in modern CNNs? | Global average pooling, before a small final classification layer. |
`,

  mcqs: `
1. What does parameter sharing in a convolutional layer mean?
   A) Different weights for every input pixel  B) The same filter weights are reused across every spatial position in the input  C) Weights are shared between different images  D) No weights are used at all
   **Answer: B** — this is what dramatically reduces parameter count versus a fully-connected layer.

2. Why does a CNN exhibit translation invariance?
   A) It doesn't  B) Because the same filter (and its learned pattern-detector) is applied at every position, so a pattern is recognized regardless of location  C) Because images are always centered  D) Because of the loss function used
   **Answer: B** — a direct consequence of weight sharing.

3. What is the receptive field of a neuron?
   A) The neuron's activation function  B) The region of the original input that neuron's output value is influenced by  C) The number of parameters in that layer  D) The output feature map's size
   **Answer: B** — it grows across layers as the network gets deeper.

4. What key innovation did ResNet introduce for CNNs?
   A) Max pooling  B) Residual (skip) connections, enabling successful training of networks over 100 layers deep  C) The convolution operation itself  D) Data augmentation
   **Answer: B** — directly addressing the vanishing gradient problem at CNN scale.

5. When would a Vision Transformer generally be preferred over a CNN?
   A) Always  B) When abundant training data is available and genuinely global, long-range image relationships matter  C) Only for very small datasets  D) Never — CNNs are always better
   **Answer: B** — ViTs lack CNNs' helpful built-in inductive biases and need more data to compensate.
`,

  "revision-notes": `
Convolutional Neural Networks (CNNs) are a specialized neural network architecture for spatial data, built around the CONVOLUTION operation: a small, learnable filter slides across the input, computing a weighted sum at each position using the SAME filter weights everywhere — this PARAMETER SHARING directly encodes two genuinely powerful assumptions about images: LOCALITY (the filter only examines a small local neighborhood at a time) and TRANSLATION INVARIANCE (the same learned pattern-detector is applied everywhere, so a useful pattern is recognized regardless of its exact position). This dramatically reduces parameter count compared to a fully-connected layer covering the same input, and directly encodes genuinely correct structural assumptions about spatial data that a generic fully-connected network would have to learn inefficiently from scratch.

POOLING layers (typically max-pooling, keeping only the maximum value in each small region) reduce a feature map's spatial dimensions while retaining the strongest detected features, improving parameter efficiency in later layers and adding a degree of additional translation invariance. STRIDE (how many pixels the filter moves between applications) and PADDING (extra border pixels, typically zero) together determine output feature map size, following the formula output = floor((input + 2×padding − filter) / stride) + 1.

A critical concept is the RECEPTIVE FIELD — the region of the ORIGINAL input a given neuron's output is influenced by — which GROWS across a CNN's layers, since a later-layer neuron is built from earlier neurons that each already "saw" their own local region. This growing receptive field is precisely what enables CNNs' hierarchical feature learning: early layers (small receptive fields) detect simple, local patterns (edges, colors), while later layers (much larger receptive fields) detect increasingly complex, larger-scale patterns (shapes, object parts, whole objects) — a network with insufficient depth or too-small filters relative to the task's actual pattern scale will have neurons that simply cannot "see" enough of the input to detect larger patterns, regardless of training quality.

Classic architectures each introduced genuine, still-influential innovations: LeNet-5 (1998) established the foundational conv-pool pattern; AlexNet (2012) combined GPU-scale depth with ReLU and dropout to trigger deep learning's modern era; VGGNet (2014) demonstrated that many small (3×3) stacked filters can outperform fewer, larger filters; RESNET (2015) introduced RESIDUAL CONNECTIONS (directly reusing the **Deep Learning** skill's own treatment of this technique), enabling CNNs over 100 layers deep by giving the gradient a direct shortcut path bypassing the vanishing-gradient-causing multiplicative shrinkage otherwise compounding across many stacked convolutional layers.

Efficiency-focused techniques include 1X1 CONVOLUTIONS (channel-wise combination with no spatial mixing, cheaply reducing channel count before a more expensive larger convolution) and DEPTHWISE SEPARABLE CONVOLUTIONS (splitting a standard convolution into a cheaper spatial-only step and a cheaper channel-combining step), the latter directly enabling efficient architectures like MobileNet for resource-constrained mobile/edge deployment. GLOBAL AVERAGE POOLING (averaging each channel's entire feature map to a single value before a much smaller final classification layer) is standard modern practice, avoiding the parameter explosion of flattening a large feature map directly into an oversized fully-connected layer.

VISION TRANSFORMERS (ViTs) represent a genuine architectural alternative, splitting an image into patches treated as tokens and applying GLOBAL self-attention across all of them (directly connecting to the **Transformers** and **Attention** skills), rather than CNNs' inherently local convolution — ViTs can more naturally capture long-range, global relationships across an entire image, but LACK CNNs' helpful built-in locality/translation-invariance biases, meaning they generally require substantially MORE training data to match or exceed CNN performance, since they must learn even these basic, generally-true structural facts about images from data rather than getting them "for free" from the architecture itself. The practical choice between CNNs and ViTs hinges directly on available training data scale — CNNs (typically via transfer learning) for limited data, ViTs for genuinely abundant data and tasks where global relationships matter.

A senior CNN practitioner defaults to transfer learning from a pretrained CNN, uses data augmentation exploiting the task's genuine spatial invariances, ensures adequate receptive field for the task's actual pattern scale, uses batch normalization and residual connections for genuinely deep architectures, and considers depthwise separable convolutions or Vision Transformers specifically when deployment constraints or data scale respectively favor them over a standard CNN.
`,

  "learning-roadmap": `
**Week 1 — Fundamentals**: understanding convolution, pooling, and parameter sharing/translation invariance. Milestone: complete Lab 1, with verified from-scratch convolution/pooling implementations.

**Week 2 — Applied training**: building and training a small CNN, visualizing learned filters. Milestone: complete Lab 2, with a trained CNN and visualized first-layer filters.

**Week 3 — Transfer learning**: fine-tuning a pretrained CNN and comparing against training from scratch. Milestone: complete Lab 3, with a documented efficiency comparison.

**Week 4 — Receptive field mastery**: calculating and empirically verifying receptive field size for a real architecture. Milestone: complete Lab 4, with a documented, verified calculation.

Next platform skill once this roadmap is complete: **RNNs**, covering the alternative specialized architecture for sequential data.
`,

  "official-docs": `
- **PyTorch's official nn.Conv2d and vision (torchvision) documentation** — the authoritative, widely-used reference for implementing and using pretrained CNNs in practice.
- **TensorFlow/Keras's official convolutional layers documentation** — another dominant framework's equivalent reference.
`,

  books: `
- **"Deep Learning" — Goodfellow, Bengio, Courville** — covers CNN fundamentals with rigorous mathematical depth.
- **"Dive into Deep Learning" (d2l.ai)** — a freely available, code-and-theory-combined textbook with strong CNN coverage.
- **CS231n course notes (Stanford, freely available online)** — widely regarded as one of the best CNN-specific educational resources available.
`,

  blogs: `
- **Christopher Olah's blog (colah.github.io)** — exceptional, highly visual explanations of convolution and CNN internals.
- **The official PyTorch and torchvision blogs** — practical, product-specific guidance on using pretrained CNN architectures.
- **Distill.pub (archived but valuable)** — exceptional visual explanations of CNN feature visualization and interpretability.
`,

  "research-papers": `
- **LeCun, Y. et al. — "Gradient-Based Learning Applied to Document Recognition"** (1998, LeNet-5) — the foundational practical CNN paper.
- **Krizhevsky, Sutskever, Hinton — "ImageNet Classification with Deep Convolutional Neural Networks"** (2012, AlexNet) — the watershed CNN paper.
- **Simonyan and Zisserman — "Very Deep Convolutional Networks for Large-Scale Image Recognition"** (2014, VGGNet).
- **He et al. — "Deep Residual Learning for Image Recognition"** (2015, ResNet).
- **Dosovitskiy et al. — "An Image is Worth 16x16 Words: Transformers for Image Recognition at Scale"** (2020, Vision Transformer).
`,

  videos: `
- **Stanford CS231n lecture videos** — widely regarded as one of the best available CNN-specific course video series.
- **3Blue1Brown's convolution explanation videos** — exceptional visual intuition for the mathematical operation itself.
- **Andrej Karpathy's CNN-related lectures and code walkthroughs** — clear, from-first-principles explanations.
`,

  "github-repos": `
- **pytorch/vision (torchvision)** — the official PyTorch computer vision library, including pretrained CNN architectures.
- **keras-team/keras** — includes extensive pretrained CNN model support (Keras Applications).
`,

  "practice-problems": `
Ordered by skill focus:

1. **Convolution arithmetic**: given a described input size, filter size, stride, and padding, calculate the resulting output feature map size.
2. **Receptive field calculation**: given a described stack of convolutional/pooling layers, calculate the final layer's receptive field size.
3. **Architecture selection**: given a described task and data scale, justify a choice between a CNN and a Vision Transformer.
4. **Efficiency tradeoff design**: given described deployment constraints (mobile vs. cloud), design an appropriate convolution strategy (standard vs. depthwise separable).
5. **External practice sets**: Stanford CS231n's assignments for hands-on CNN implementation and architecture design practice.
`,

  "architecture-diagram": `
~~~mermaid
flowchart TB
    subgraph Input["Input Image"]
        RawImage["Raw pixels (H x W x 3)"]
    end
    subgraph ConvStack["Convolutional Stack"]
        Conv1["Conv + ReLU + Pool\n(simple features: edges)"]
        Conv2["Conv + ReLU + Pool\n(combined patterns: textures)"]
        Conv3["Conv + ReLU + Pool\n(abstract features: object parts)"]
    end
    subgraph Head["Classification Head"]
        GAP["Global Average Pooling"]
        FC["Small Fully-Connected Layer"]
        Softmax["Softmax Output"]
    end
    RawImage --> Conv1 --> Conv2 --> Conv3
    Conv3 --> GAP --> FC --> Softmax
~~~
`,

  "mind-map": `
~~~mermaid
mindmap
  root((CNNs))
    Foundations
      Overview
      History LeNet AlexNet ResNet ViT
      Why it exists
      Problem it solves
    Core Operations
      Convolution
      Parameter sharing
      Translation invariance
      Pooling
      Stride and padding
    Receptive Field
      Growth across layers
      Hierarchical feature learning
    Classic Architectures
      LeNet 5
      AlexNet
      VGGNet
      ResNet residual connections
    Efficiency Techniques
      1x1 convolutions
      Depthwise separable convolutions
      Global average pooling
    CNN vs Vision Transformer
      Inductive bias tradeoff
      Data scale dependence
    Practice
      Interview questions
      Coding problems
      Hands-on labs
      Real projects
~~~
`,
};

export default cnn;
