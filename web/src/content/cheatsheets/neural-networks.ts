import type { CheatSheetData } from "./types";

const neuralNetworksCheatSheet: CheatSheetData = {
  title: "Neural Networks",
  subtitle: "Perceptrons, backprop, activation functions",
  sections: [
    {
      title: "The Perceptron",
      color: "violet",
      rows: [
        { term: "Basic unit", desc: "Weighted sum of inputs + bias, then an activation function" },
        { term: "Key limitation", desc: "Only learns LINEAR decision boundaries — can't solve XOR" },
        { term: "Why non-linearity matters", desc: "Stacked linear layers collapse into one linear function" },
      ],
    },
    {
      title: "Activation Functions",
      color: "blue",
      rows: [
        { term: "Sigmoid", desc: "0 to 1, derivative <= 0.25 -> vanishing gradients" },
        { term: "Tanh", desc: "-1 to 1, same vanishing-gradient issue as sigmoid" },
        { term: "ReLU", desc: "max(0,x), gradient = 1 for x>0 — the modern default" },
        { term: "Leaky ReLU / GELU", desc: "Allows small negative-input gradient — fixes dying ReLU" },
      ],
    },
    {
      title: "Softmax",
      color: "emerald",
      rows: [
        {
          term: "Numerically stable softmax",
          desc: "Converts logits -> probability distribution",
          code: "shifted = logits - max(logits)\nprobs = exp(shifted) / sum(exp(shifted))",
        },
      ],
    },
    {
      title: "Output Layer Matching",
      color: "amber",
      rows: [
        { term: "Binary classification", desc: "Sigmoid, 1 unit" },
        { term: "Multi-class (exclusive)", desc: "Softmax, N units" },
        { term: "Multi-label (independent)", desc: "Sigmoid PER unit, N units" },
        { term: "Regression", desc: "No activation (linear, unbounded)" },
      ],
    },
    {
      title: "Universal Approximation Theorem",
      color: "rose",
      rows: [
        { term: "Guarantees", desc: "1 hidden layer + enough neurons = can approximate ANY continuous fn" },
        { term: "Does NOT guarantee", desc: "How many neurons, or that training will find the right params" },
        { term: "Why go deep instead of wide", desc: "Depth is far more parameter-efficient in practice" },
      ],
    },
    {
      title: "Dying ReLU",
      color: "cyan",
      rows: [
        { term: "Cause", desc: "Neuron's input goes permanently negative -> zero gradient forever" },
        { term: "Fix", desc: "Leaky ReLU/GELU, or better initialization/learning rate" },
      ],
    },
  ],
};

export default neuralNetworksCheatSheet;
