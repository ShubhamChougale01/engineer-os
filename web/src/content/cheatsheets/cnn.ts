import type { CheatSheetData } from "./types";

const cnn: CheatSheetData = {
  title: "The Ultimate CNNs Cheat Sheet",
  subtitle: "Convolution mechanics · classic architectures · training · production deployment",
  sections: [
    {
      title: "Core Operation",
      color: "violet",
      rows: [
        { term: "Convolution", desc: "Slide a small learnable filter, dot-product each patch", code: "out[i,j] = sum(patch * kernel) + bias" },
        { term: "Output size formula", desc: "Compute a conv layer's output shape", code: "out = floor((in + 2*pad - k) / stride) + 1" },
        { term: "Stride", desc: "How far the filter moves between applications", code: "stride=1 dense map\nstride=2 halves output size" },
        { term: "Padding", desc: "Border pixels so edges are covered, size is controlled", code: "padding=0 -> 'valid', shrinks\npadding=(k-1)/2 -> 'same', preserves size" },
        { term: "Feature map", desc: "One filter's output over the whole input", code: "n_filters -> n_output_channels" },
        { term: "Kernel spans full depth", desc: "A filter always covers all input channels", code: "Conv2d(in_channels=3, out_channels=8, kernel_size=3)\n# each filter shape: 3x3x3" },
        { term: "Parameter sharing", desc: "Same filter weights reused at every position", code: "params = out_ch * (k*k*in_ch + 1)\n# independent of image size" },
        { term: "Translation equivariance", desc: "Shift input -> feature map shifts identically", code: "the property MLPs lack entirely" },
      ],
    },
    {
      title: "Pooling & Receptive Field",
      color: "blue",
      rows: [
        { term: "Max pooling", desc: "Keep the strongest activation per window", code: "nn.MaxPool2d(kernel_size=2, stride=2)" },
        { term: "Average pooling", desc: "Smooth summary of each window", code: "nn.AvgPool2d(kernel_size=2, stride=2)" },
        { term: "Global average pool", desc: "One number per channel — replaces flatten+FC", code: "nn.AdaptiveAvgPool2d(1)\n# cuts head parameters drastically" },
        { term: "Why pooling helps", desc: "Downsampling + local shift-tolerance", code: "small input shift -> same max in window\n-> same output" },
        { term: "Receptive field", desc: "Input region influencing one output unit", code: "rf_new = rf_old + (kernel-1) * stride_so_far" },
        { term: "Two 3x3 vs one 5x5", desc: "Same receptive field, fewer params, extra nonlinearity", code: "2*(3*3)=18 params vs 5*5=25\nplus an extra ReLU in between" },
        { term: "1x1 convolution", desc: "Mixes channels only, no spatial neighbors", code: "Conv2d(256, 64, kernel_size=1)  # bottleneck" },
        { term: "Depthwise separable conv", desc: "Split spatial + channel mixing — cheap, mobile-friendly", code: "depthwise: 1 filter per channel (spatial)\npointwise: 1x1 conv (channel mix)\n~8-9x cheaper than standard conv" },
      ],
    },
    {
      title: "Classic Architectures",
      color: "emerald",
      rows: [
        { term: "LeNet-5 (1998)", desc: "conv-pool-conv-pool-FC template", code: "still the shape of every CNN today" },
        { term: "AlexNet (2012)", desc: "ImageNet breakthrough: ReLU + dropout + GPUs", code: "won ILSVRC 2012 by a huge margin" },
        { term: "VGG (2014)", desc: "Depth from stacked small 3x3 filters", code: "16-19 layers, uniform 3x3 convs" },
        { term: "GoogLeNet/Inception", desc: "Parallel filter sizes in one block", code: "1x1, 3x3, 5x5 branches concatenated" },
        { term: "ResNet (2015)", desc: "Residual connections solve the degradation problem", code: "out = F(x) + x\nenabled 50-150+ layer networks" },
        { term: "MobileNet", desc: "Depthwise separable convs for edge/mobile", code: "8-9x cheaper, small accuracy cost" },
        { term: "Vision Transformer (ViT)", desc: "Patches as tokens, pure self-attention, no conv", code: "matches/exceeds CNNs at large scale\nsee the Transformers skill" },
        { term: "ConvNeXt", desc: "Modernized CNN closing the gap with ViT", code: "transformer-era training recipe on a CNN" },
      ],
    },
    {
      title: "Training Workflow",
      color: "amber",
      rows: [
        { term: "Standard block", desc: "Conv + BatchNorm + ReLU", code: "nn.Conv2d(in_c, out_c, 3, padding=1, bias=False)\nnn.BatchNorm2d(out_c)\nnn.ReLU(inplace=True)" },
        { term: "Training loop core", desc: "Forward, loss, backward, step", code: "logits = model(images)\nloss = criterion(logits, labels)\nloss.backward(); optimizer.step()" },
        { term: "Data augmentation (train only)", desc: "Teach invariances the conv doesn't give for free", code: "T.RandomResizedCrop(224)\nT.RandomHorizontalFlip()\nT.ColorJitter(0.2, 0.2, 0.2)" },
        { term: "Normalization stats", desc: "Must match the pretrained backbone exactly", code: "mean=[0.485, 0.456, 0.406]\nstd=[0.229, 0.224, 0.225]" },
        { term: "Transfer learning phase 1", desc: "Freeze backbone, train new head only", code: "for p in model.parameters(): p.requires_grad = False\nmodel.fc = nn.Linear(model.fc.in_features, n_classes)" },
        { term: "Transfer learning phase 2", desc: "Unfreeze top block(s), fine-tune at low LR", code: "for p in model.layer4.parameters(): p.requires_grad = True\n# use ~10x smaller learning rate" },
        { term: "Eval mode", desc: "Disable dropout, freeze BatchNorm running stats", code: "model.eval()\nwith torch.no_grad(): logits = model(x)" },
        { term: "Mixed precision", desc: "~2x throughput, negligible accuracy loss", code: "from torch.cuda.amp import autocast\nwith autocast(): logits = model(x)" },
      ],
    },
    {
      title: "Pitfalls & Gotchas",
      color: "rose",
      rows: [
        { term: "Preprocessing mismatch", desc: "#1 cause of 'works in notebook, fails in prod'", code: "train and serve MUST use identical\nresize + normalize + channel order" },
        { term: "Forgot model.eval()", desc: "BatchNorm/Dropout stay in train mode", code: "always call model.eval() before inference\nand model.train() before the next epoch" },
        { term: "Augmenting val/test set", desc: "Inflates or randomizes your accuracy signal", code: "val/test transforms: resize + normalize only\nNO random augmentation" },
        { term: "Class imbalance ignored", desc: "99% accuracy can mean 'always predicts majority'", code: "nn.CrossEntropyLoss(weight=class_weights)" },
        { term: "Train/test resolution mismatch", desc: "CNN accuracy is sensitive to this", code: "fine-tune briefly at the new resolution\nif you must change it" },
        { term: "Wrong augmentation for the task", desc: "Flips/color jitter aren't universally safe", code: "no horizontal flip for text/digits\nno color jitter for medical scans" },
        { term: "Flatten instead of GAP", desc: "Huge FC layers, most of VGG's params", code: "prefer nn.AdaptiveAvgPool2d(1) + small FC" },
        { term: "Training from scratch on tiny data", desc: "Reliably overfits a few thousand images", code: "use a pretrained backbone instead" },
      ],
    },
    {
      title: "Production Toolbelt",
      color: "cyan",
      rows: [
        { term: "Export to ONNX", desc: "Framework-agnostic serving artifact", code: "torch.onnx.export(model, dummy_input, 'model.onnx',\n  dynamic_axes={'input': {0: 'batch'}})" },
        { term: "Serve with ONNX Runtime", desc: "No training-framework dependency in serving", code: "session = ort.InferenceSession('model.onnx')\nout = session.run(['logits'], {'image': arr})" },
        { term: "TensorRT", desc: "Fused kernels, fastest GPU inference", code: "compiles the ONNX graph further\nfor latency-critical serving" },
        { term: "Quantization (int8)", desc: "2-4x smaller/faster, small accuracy cost", code: "validate the accuracy drop on your\nown held-out eval set" },
        { term: "Optimization order", desc: "Apply cheapest wins first", code: "pretrained -> right-sized arch -> mixed precision\n-> batching -> quantization -> ONNX/TensorRT" },
        { term: "Latency benchmark pattern", desc: "Warm up, then time many runs", code: "for _ in range(10): model(x)  # warmup\ntorch.cuda.synchronize(); start = time.perf_counter()" },
        { term: "Health check", desc: "Run a real forward pass, not just 'process up'", code: "/healthz -> forward pass on a fixed dummy image" },
        { term: "Monitoring signals", desc: "Beyond RED metrics: model-quality drift", code: "prediction confidence distribution\nclass distribution over time" },
      ],
    },
  ],
};

export default cnn;
