import type { CheatSheetData } from "./types";

const cnnCheatSheet: CheatSheetData = {
  title: "CNNs",
  subtitle: "Convolutional networks for spatial data",
  sections: [
    {
      title: "Core Operation",
      color: "violet",
      rows: [
        { term: "Convolution", desc: "Small filter slides across input, same weights everywhere" },
        { term: "Parameter sharing", desc: "Dramatically fewer params than a fully-connected layer" },
        { term: "Translation invariance", desc: "Pattern recognized regardless of position" },
        {
          term: "Output size formula",
          desc: "",
          code: "output = floor((input + 2*padding - filter) / stride) + 1",
        },
      ],
    },
    {
      title: "Pooling & Receptive Field",
      color: "blue",
      rows: [
        { term: "Max pooling", desc: "Keep max value per region — reduces size, keeps strongest features" },
        { term: "Receptive field", desc: "Input region a neuron's output depends on — grows with depth" },
      ],
    },
    {
      title: "Classic Architectures",
      color: "emerald",
      rows: [
        { term: "LeNet-5", desc: "Early conv-pool pattern (1998)" },
        { term: "AlexNet", desc: "Deep + ReLU + dropout + GPUs — 2012 breakthrough" },
        { term: "VGGNet", desc: "Many small (3x3) stacked filters > fewer large ones" },
        { term: "ResNet", desc: "Residual connections -> 100+ layers deep" },
      ],
    },
    {
      title: "Efficiency Techniques",
      color: "amber",
      rows: [
        { term: "1x1 convolutions", desc: "Channel-wise mixing, no spatial mixing — cheap channel reduction" },
        { term: "Depthwise separable conv", desc: "Split spatial+channel steps — MobileNet-style efficiency" },
        { term: "Global average pooling", desc: "Replaces large FC layer, cuts parameters significantly" },
      ],
    },
    {
      title: "CNN vs Vision Transformer",
      color: "rose",
      rows: [
        { term: "CNN", desc: "Strong locality/translation-invariance bias — better with limited data" },
        { term: "ViT", desc: "No built-in bias, global attention — needs more data to compete" },
      ],
    },
  ],
};

export default cnnCheatSheet;
