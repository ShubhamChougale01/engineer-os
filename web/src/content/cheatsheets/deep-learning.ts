import type { CheatSheetData } from "./types";

const deepLearningCheatSheet: CheatSheetData = {
  title: "Deep Learning",
  subtitle: "Training deep neural networks",
  sections: [
    {
      title: "Core Idea",
      color: "violet",
      rows: [
        { term: "Representation learning", desc: "Layers automatically learn increasingly abstract features" },
        { term: "Backpropagation", desc: "Chain rule computes each parameter's contribution to the loss" },
      ],
    },
    {
      title: "Gradient Problems",
      color: "rose",
      rows: [
        { term: "Vanishing gradients", desc: "Shrinks exponentially through layers — early layers stop learning" },
        { term: "Exploding gradients", desc: "Grows exponentially — unstable, oscillating training" },
        { term: "Gradient clipping", desc: "Cap gradient magnitude at a threshold — fixes exploding" },
      ],
    },
    {
      title: "Architectural Fixes",
      color: "blue",
      rows: [
        {
          term: "Residual connections",
          desc: "Gradient gets a direct shortcut path",
          code: "output = sublayer(x) + x",
        },
        { term: "Good initialization", desc: "Xavier/Glorot, He — keeps gradients stable from the start" },
        { term: "Batch normalization", desc: "Stabilizes layer input distributions" },
      ],
    },
    {
      title: "Optimizers",
      color: "emerald",
      rows: [
        { term: "SGD (+ momentum)", desc: "Simple, needs learning-rate tuning" },
        { term: "Adam", desc: "Adaptive per-parameter LR — strong default, faster convergence" },
      ],
    },
    {
      title: "Regularization",
      color: "amber",
      rows: [
        { term: "Dropout", desc: "Randomly zero neurons during training -> robust features" },
        { term: "Batch norm", desc: "Also has a mild regularizing effect" },
      ],
    },
    {
      title: "Transfer Learning",
      color: "cyan",
      rows: [
        { term: "The dominant paradigm", desc: "Pretrain on huge data, fine-tune on small task-specific data" },
        { term: "Freeze early layers", desc: "Train only later layers when task data is limited" },
      ],
    },
  ],
};

export default deepLearningCheatSheet;
